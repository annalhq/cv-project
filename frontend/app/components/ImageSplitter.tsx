"use client";

import { useRef, useState, useCallback } from "react";
import {
  SplitterUploadZone,
  SplitterOptions,
  SplitterResults,
} from "./splitter";
import { ImageModal } from "./pipeline";
import type { SplitConfig } from "./splitter";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChunkData {
  dataUrl: string;
  filename: string;
  url: string;
}

/**
 * Main orchestrator for the Image Splitter utility.
 * Uploads image to backend, which splits it using OpenCV,
 * then displays results with download / send-to-stitcher options.
 */
export default function ImageSplitter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [config, setConfig] = useState<SplitConfig>({
    chunks: 4,
    direction: "vertical",
    overlapRatio: 0.2,
  });


  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setChunks([]);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) loadFile(f);
    },
    [loadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) loadFile(f);
    },
    [loadFile]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setChunks([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);


  const splitImage = useCallback(async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setChunks([]);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("chunks", String(config.chunks));
      formData.append("direction", config.direction);
      formData.append("overlap_ratio", String(config.overlapRatio));

      const res = await fetch(`${API_BASE}/api/splitter/run`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Split failed");
      }

      const data = await res.json();

      // Map results to ChunkData with full URLs
      const resultChunks: ChunkData[] = data.results.map(
        (r: { url: string; filename: string }) => ({
          dataUrl: `${API_BASE}${r.url}`,
          filename: r.filename,
          url: r.url,
        })
      );

      setChunks(resultChunks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Split failed");
    } finally {
      setLoading(false);
    }
  }, [file, config]);


  const downloadAll = useCallback(async () => {
    for (const chunk of chunks) {
      try {
        const res = await fetch(chunk.dataUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = chunk.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        /* skip failed downloads */
      }
    }
  }, [chunks]);


  const sendToStitcher = useCallback(async () => {
    // Store chunk URLs in sessionStorage for the pipeline page to pick up
    const items = chunks.map((c) => ({
      name: c.filename,
      url: c.dataUrl,
    }));

    try {
      sessionStorage.setItem("splitter_chunks", JSON.stringify(items));
      window.location.href = "/pipeline?from=splitter";
    } catch {
      setError(
        "Failed to transfer chunks. Please download them and re-upload on the Pipeline page."
      );
    }
  }, [chunks]);

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-eloquia text-white tracking-tight">
          Image Splitter
        </h1>
        <p className="text-white/40 mt-2 text-sm md:text-base">
          Split a single image into overlapping chunks — perfect for testing the
          stitching pipeline
        </p>
      </div>

      {/* Upload zone */}
      <SplitterUploadZone
        fileInputRef={fileInputRef}
        preview={preview}
        file={file}
        onFileChange={handleFileChange}
        onDrop={handleDrop}
        onClear={clearFile}
      />

      {/* Configuration */}
      {file && (
        <SplitterOptions
          config={config}
          onChange={setConfig}
          onSplit={splitImage}
          loading={loading}
          hasFile={!!file}
        />
      )}

      {/* Error alert */}
      {error && (
        <div className="alert bg-red-500/10 border border-red-500/30 text-red-400 mb-8 rounded-xl">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      <SplitterResults
        chunks={chunks}
        direction={config.direction}
        onDownloadAll={downloadAll}
        onSendToStitcher={sendToStitcher}
        onImageClick={setModalImage}
      />

      {/* Lightbox modal */}
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
}
