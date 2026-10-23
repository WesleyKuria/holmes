function createLoadingButton() {
  if (document.getElementById("loading-button")) return;

  const targetDiv = document.querySelector(".aeF");
  if (targetDiv) {
    const button = document.createElement("button");
    button.textContent = "🔍 Holmes: Ready";
    button.id = "loading-button";
    button.style.cssText = `
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 6px 12px;
      background-color: #1c1917;
      color: #f59e0b;
      border: 1px solid #d97706;
      border-radius: 6px;
      cursor: pointer;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      z-index: 9999;
      transition: all 0.2s ease;
    `;
    targetDiv.appendChild(button);
    console.log("Holmes detective button added to Gmail");
  }
}

function updateLoadingButton() {
  const loadingButton = document.getElementById("loading-button");
  if (!loadingButton) return;

  chrome.storage.local.get(["inferenceResult"], (items) => {
    const inferenceResult = items.inferenceResult;
    if (!inferenceResult) return;

    console.log(
      "Holmes content script loaded inference result:",
      inferenceResult
    );

    const score =
      inferenceResult.risk_score !== undefined
        ? inferenceResult.risk_score
        : inferenceResult.phishing_score !== undefined
        ? inferenceResult.phishing_score * 10
        : 0;
    const level = (inferenceResult.threat_level || "").toLowerCase();

    if (level === "dangerous" || score >= 70) {
      loadingButton.style.backgroundColor = "#881337";
      loadingButton.style.color = "#ffe4e6";
      loadingButton.style.borderColor = "#f43f5e";
      loadingButton.textContent = `🚨 Holmes: Threat Detected (${score}/100)`;
    } else if (level === "suspicious" || score >= 31) {
      loadingButton.style.backgroundColor = "#78350f";
      loadingButton.style.color = "#fef3c7";
      loadingButton.style.borderColor = "#fbbf24";
      loadingButton.textContent = `⚠️ Holmes: Suspicious (${score}/100)`;
    } else {
      loadingButton.style.backgroundColor = "#064e3b";
      loadingButton.style.color = "#d1fae5";
      loadingButton.style.borderColor = "#34d399";
      loadingButton.textContent = `🛡️ Holmes: Verified Safe (${score}/100)`;
    }
  });
}

function resetLoadingButton() {
  const loadingButton = document.getElementById("loading-button");
  if (loadingButton) {
    loadingButton.style.backgroundColor = "#1c1917";
    loadingButton.style.color = "#f59e0b";
    loadingButton.style.borderColor = "#d97706";
    loadingButton.textContent = "🔍 Holmes: Ready";
  }
}

function detectDOMChange() {
  const currentUrl = window.location.href;
  createLoadingButton();

  const gmailInboxPattern =
    /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/#inbox$/;
  const gmailSearchPattern =
    /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/#search\/[^/]+$/;
  const gmailInboxMsgPattern =
    /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/#inbox\//;
  const gmailSearchMsgPattern =
    /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/#search\/[^/]+\/[^/]+$/;

  if (
    gmailInboxPattern.test(currentUrl) ||
    gmailSearchPattern.test(currentUrl)
  ) {
    console.log("Detected Gmail Home page");
    chrome.storage.local.clear().then(
      () => {
        console.log("Local storage cleared");
        resetLoadingButton();
      },
      (error) => {
        console.error("Error clearing local storage:", error);
      }
    );
  } else if (
    gmailInboxMsgPattern.test(currentUrl) ||
    gmailSearchMsgPattern.test(currentUrl)
  ) {
    console.log("Detected email page");
    const [gmidKey, permMsgId] = inEmailPage();
    if (!gmidKey || !permMsgId) {
      console.log("Could not scrape email data.");
      return;
    }
    const gmailLink = `https://mail.google.com/mail/u/0/?ik=${gmidKey}&view=om&permmsgid=msg-${permMsgId}`;
    chrome.runtime.sendMessage({ action: "openTab", url: gmailLink });
    const loadingButton = document.getElementById("loading-button");
    if (loadingButton) {
      loadingButton.textContent = "🕵️ Holmes: Investigating...";
    }
  }
}

function inEmailPage() {
  const getSpan = document
    .querySelector("h2.hP")
    ?.getAttribute("data-thread-perm-id");
  let gmidKey = document
    .querySelector("link#embedded_data_iframe")
    ?.getAttribute("data-recorded-src");

  if (!gmidKey) {
    console.log("Could not get gmid key");
    return [null, null];
  }

  const values = gmidKey.split(",");
  gmidKey = values[1]?.slice(3, -3);
  console.log("Gmid_key:", gmidKey);

  if (!getSpan) {
    console.log("Could not get span");
    return [null, null];
  }

  const permMsgId = getSpan.slice(7);
  console.log("permmsgid:", permMsgId);

  return [gmidKey, permMsgId];
}

function getRawEML() {
  return (
    (document.querySelector(".raw_message") as HTMLElement)?.innerText || ""
  );
}

(function init() {
  const gmailEmlPattern =
    /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/\?ik=.*$/;

  if (gmailEmlPattern.test(window.location.href)) {
    const text = getRawEML();
    chrome.runtime.sendMessage({
      action: "closeTab",
      url: window.location.href,
    });
    chrome.runtime.sendMessage({ action: "processEML", input: text });
    return;
  }

  try {
    const observer = new MutationObserver(detectDOMChange);
    // wait for DOM to load before observing
    setTimeout(() => {
      observer.observe(document.body, { childList: true, subtree: false });
      console.log("Observer created");
    }, 1000);

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "receivedInference") {
        console.log("Content script received inference result");
        updateLoadingButton();
      }
    });
    console.log("Content script loaded successfully.");
  } catch (e) {
    console.error(`Error loading content script: ${e}`);
  }
})();
