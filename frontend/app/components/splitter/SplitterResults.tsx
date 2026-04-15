"use client";

interface ChunkData {
  dataUrl: string;
  filename: string;
}

interface SplitterResultsProps {
  chunks: ChunkData[];
  direction: "vertical" | "horizontal";
  onDownloadAll: () => void;
  onSendToStitcher: () => void;
  onImageClick: (url: string) => void;
}

export default function SplitterResults({
  chunks,
  direction,
  onDownloadAll,
  onSendToStitcher,
  onImageClick,
}: SplitterResultsProps) {
  if (chunks.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Results header */}
      <div className="border border-emerald-500/30 rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-500/5 to-transparent">
        <div className="px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          <h3 className="text-xl font-eloquia text-white flex items-center gap-2">
            <svg
              className="w-6 h-6 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Split Results
            <span className="badge badge-sm bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">
              {chunks.length} chunks
            </span>
          </h3>
        </div>

        {/* Chunks grid */}
        <div className="p-6">
          <div
            className={`grid gap-4 ${
              direction === "vertical"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {chunks.map((chunk, i) => (
              <div
                key={i}
                className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/40 bg-black/30 transition-all duration-300 cursor-pointer"
                onClick={() => onImageClick(chunk.dataUrl)}
              >
                <img
                  src={chunk.dataUrl}
                  alt={`Chunk ${i + 1}`}
                  className="w-full h-32 md:h-40 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {/* Overlay badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white/80 text-xs px-2 py-1 rounded-lg font-mono">
                  {i + 1}
                </div>
                {/* Download single */}
                <a
                  href={chunk.dataUrl}
                  download={chunk.filename}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/70 backdrop-blur-sm text-white/80 hover:text-white p-1.5 rounded-lg transition-all duration-300"
                  title="Download this chunk"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Download all */}
            <button
              onClick={onDownloadAll}
              className="btn bg-base-200 hover:bg-base-300 border-2 border-white/20 text-white rounded-xl px-8 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download All Chunks
            </button>

            {/* Send to stitcher */}
            <button
              onClick={onSendToStitcher}
              className="btn bg-orange-500 hover:bg-orange-400 border-2 border-orange-700 text-white rounded-xl px-8 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,0.7)] hover:-translate-y-0.5 active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_rgba(234,88,12,0.7)] transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Send to Image Stitcher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
