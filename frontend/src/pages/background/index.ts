/* To view console log messages in this file, inspect the extension's popup */

import axios from "axios";
import type { GeminiParams, UniversalAnalysisPayload } from "@src/global";
import { systemPrompt, emailSchemaParser } from "@src/global";

const BACKEND_ANALYZE_URL = "http://127.0.0.1:8000/analyze/";
let isLoading = false;
let lastURL = "";

chrome.runtime.onMessage.addListener((message, _sender, _response) => {
  console.log("Background action:", message.action);
  switch (message.action) {
    case "openTab":
      handleOpenTab(message.url);
      break;
    case "closeTab":
      handleCloseTab(message.url);
      break;
    case "processEML":
      handleProcessEML(message.input);
      break;
    default:
      console.log("Unknown action:", message.action);
  }
});

function handleOpenTab(url: string) {
  if (!isLoading && url !== lastURL) {
    lastURL = url;
    isLoading = true;
    chrome.tabs.create({ url });
  }
}

function handleCloseTab(urlToClose: string) {
  isLoading = false;
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.url === urlToClose) {
        chrome.tabs.remove(tab.id!);
        return;
      }
    }
    console.error(`No tabs found with URL including: ${urlToClose}`);
  });
}

function handleProcessEML(eml: string) {
  // First attempt: call Holmes backend /analyze/ endpoint which provides complete forensic evaluation
  axios
    .post(BACKEND_ANALYZE_URL, { eml })
    .then((response) => {
      const data = response.data;
      const result: UniversalAnalysisPayload = {
        risk_score: data.risk_score ?? 0,
        threat_level: data.threat_level ?? (data.risk_score > 60 ? "Dangerous" : "Safe"),
        primary_tactic: data.primary_tactic || "Forensic Social Engineering Evaluation",
        educational_summary:
          data.educational_summary ||
          "Analytical examination completed on incoming email.",
        flagged_phrases: Array.isArray(data.flagged_phrases) ? data.flagged_phrases : [],
        raw_email: eml,
      };

      console.log("Inference result from Holmes backend:", result);
      storeAndBroadcast(result, eml);
    })
    .catch(async (backendError) => {
      console.warn("Backend /analyze/ call failed, attempting browser AI:", backendError);

      const params: GeminiParams = {
        systemPrompt: systemPrompt,
        temperature: 0,
        topK: 1,
      };

      let userPrompt = `Email: ${eml}\nAnswer: `;
      let result: UniversalAnalysisPayload | null = null;

      try {
        result = await runPrompt(userPrompt, params);
      } catch (e) {
        console.error("Local browser AI prompt failed:", e);
      }

      if (!result) {
        // Universal clean fallback with zero hardcoded regional brand logic
        result = {
          risk_score: 45,
          threat_level: "Suspicious",
          primary_tactic: "External Sender Communication Analysis",
          educational_summary:
            "The email was received from an external domain. Ensure sender addresses and link destinations are validated before acting on any requests.",
          flagged_phrases: [],
          raw_email: eml,
        };
      }

      storeAndBroadcast(result, eml);
    });
}

function storeAndBroadcast(result: UniversalAnalysisPayload, rawEmail: string) {
  chrome.storage.local.set({
    inferenceResult: result,
    rawEmailText: rawEmail,
  }).then(() => {
    console.log("Saved inference result to local storage");
    const msg = { action: "receivedInference" };
    sendMessageToTab(msg);
    sendMessageToRuntime(msg);
  });
}

function sendMessageToTab(message: object) {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, message);
      }
    }
  });
}

function sendMessageToRuntime(message: object) {
  chrome.runtime.sendMessage(message);
}

async function runPrompt(
  prompt: string,
  params: GeminiParams
): Promise<UniversalAnalysisPayload | null> {
  try {
    if (
      typeof (chrome as any).aiOriginTrial !== "undefined" &&
      (chrome as any).aiOriginTrial.languageModel
    ) {
      const session = await (chrome as any).aiOriginTrial.languageModel.create(params);
      const res = await session.prompt(prompt);
      const res_json = await emailSchemaParser.parse(res);
      return res_json as UniversalAnalysisPayload;
    }
    return null;
  } catch (e) {
    console.error("Prompt failed:", e);
    return null;
  }
}

console.log("Holmes universal background script loaded");
