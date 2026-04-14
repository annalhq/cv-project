"use client";

import { useCallback } from "react";

interface SplitterUploadZoneProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onClear: () => void;
}

export default function SplitterUploadZone({
  fileInputRef,
  preview,
  file,
  onFileChange,
  onDrop,
  onClear,
}: SplitterUploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop(e);
    },
    [onDrop]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="mb-8">
      <div
        className="relative border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-2xl p-10 text-center transition-all duration-500 group cursor-pointer bg-gradient-to-b from-white/[0.02] to-transparent"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          id="splitter-upload"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-orange-500/10 flex items-center justify-center transition-all duration-500">
            <svg
              className="w-8 h-8 text-white/30 group-hover:text-orange-500 transition-colors duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-white/60 text-lg font-medium">
              Drop an image here or{" "}
              <span className="text-orange-500 underline underline-offset-4">
                browse
              </span>
            </p>
            <p className="text-white/25 text-sm mt-1">
              Upload a single image to split into overlapping chunks
            </p>
          </div>
        </div>
      </div>

      {preview && file && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-sm">
              {file.name}{" "}
              <span className="text-white/30">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="btn btn-ghost btn-xs text-white/40 hover:text-white"
            >
              Remove
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="relative flex-shrink-0 w-48 h-36 rounded-xl overflow-hidden border border-white/10">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
