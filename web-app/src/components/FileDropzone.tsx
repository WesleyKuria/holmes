import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileLoaded: (content: string, fileName: string) => void;
  isLoading?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileLoaded,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileError(null);
    if (!file.name.endsWith('.eml') && !file.name.endsWith('.txt') && !file.name.endsWith('.msg')) {
      setFileError('Please upload a valid .eml or raw text email file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setLoadedFileName(file.name);
        onFileLoaded(content, file.name);
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read the file contents.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 shadow-glow-indigo'
            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".eml,.txt,.msg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Drag & drop raw <span className="font-mono text-indigo-400">.eml</span> file here, or browse
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Supports RFC 822 email format exported from Gmail, Outlook, Thunderbird, or Apple Mail
          </p>
        </div>

        {loadedFileName ? (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Loaded: {loadedFileName}</span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-slate-500">
            Files are analyzed in-memory with local PII scrubbing
          </span>
        )}
      </div>

      {fileError && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
};
