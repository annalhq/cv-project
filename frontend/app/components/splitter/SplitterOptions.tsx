"use client";

export interface SplitConfig {
  chunks: number;
  direction: "vertical" | "horizontal";
  overlapRatio: number;
}

interface SplitterOptionsProps {
  config: SplitConfig;
  onChange: (config: SplitConfig) => void;
  onSplit: () => void;
  loading: boolean;
  hasFile: boolean;
}

export default function SplitterOptions({
  config,
  onChange,
  onSplit,
  loading,
  hasFile,
}: SplitterOptionsProps) {
  return (
    <div className="mb-10">
      <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Split Configuration
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Number of chunks */}
          <div className="form-control w-full">
            <label className="label" htmlFor="splitter-chunks">
              <span className="label-text text-white/50 text-sm">
                Number of Chunks
              </span>
            </label>
            <input
              id="splitter-chunks"
              type="number"
              min={2}
              max={20}
              value={config.chunks}
              onChange={(e) =>
                onChange({
                  ...config,
                  chunks: Math.max(2, Math.min(20, parseInt(e.target.value) || 2)),
                })
              }
              className="input input-bordered w-full bg-white/5 border-white/10 text-white focus:border-orange-500/50 focus:outline-none placeholder-white/20"
            />
            <label className="label">
              <span className="label-text-alt text-white/25">Between 2 – 20</span>
            </label>
          </div>

          {/* Direction */}
          <div className="form-control w-full">
            <label className="label" htmlFor="splitter-direction">
              <span className="label-text text-white/50 text-sm">
                Split Direction
              </span>
            </label>
            <select
              id="splitter-direction"
              value={config.direction}
              onChange={(e) =>
                onChange({
                  ...config,
                  direction: e.target.value as "vertical" | "horizontal",
                })
              }
              className="select select-bordered w-full bg-white/5 border-white/10 text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="vertical" className="bg-neutral text-white">
                Vertical (left → right)
              </option>
              <option value="horizontal" className="bg-neutral text-white">
                Horizontal (top → bottom)
              </option>
            </select>
            <label className="label">
              <span className="label-text-alt text-white/25">
                {config.direction === "vertical"
                  ? "Slices image into columns"
                  : "Slices image into rows"}
              </span>
            </label>
          </div>

          {/* Overlap ratio */}
          <div className="form-control w-full">
            <label className="label" htmlFor="splitter-overlap">
              <span className="label-text text-white/50 text-sm">
                Overlap Ratio
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="splitter-overlap"
                type="range"
                min={0}
                max={50}
                value={Math.round(config.overlapRatio * 100)}
                onChange={(e) =>
                  onChange({
                    ...config,
                    overlapRatio: parseInt(e.target.value) / 100,
                  })
                }
                className="range range-sm range-warning flex-1"
              />
              <span className="text-orange-400 font-mono text-sm min-w-[3rem] text-right">
                {Math.round(config.overlapRatio * 100)}%
              </span>
            </div>
            <label className="label">
              <span className="label-text-alt text-white/25">
                Overlap between adjacent chunks
              </span>
            </label>
          </div>
        </div>

        {/* Visual preview of split direction */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex-shrink-0">
              {config.direction === "vertical" ? (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(config.chunks, 6) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-10 bg-orange-500/30 border border-orange-500/50 rounded-sm"
                      style={{ opacity: 0.4 + (i / config.chunks) * 0.6 }}
                    />
                  ))}
                  {config.chunks > 6 && (
                    <span className="text-white/30 text-xs self-center ml-1">
                      +{config.chunks - 6}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {Array.from({ length: Math.min(config.chunks, 6) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-3 bg-orange-500/30 border border-orange-500/50 rounded-sm"
                      style={{ opacity: 0.4 + (i / config.chunks) * 0.6 }}
                    />
                  ))}
                  {config.chunks > 6 && (
                    <span className="text-white/30 text-xs text-center mt-0.5">
                      +{config.chunks - 6}
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-white/30 text-sm">
              Image will be split into{" "}
              <span className="text-orange-400 font-medium">{config.chunks}</span>{" "}
              {config.direction === "vertical" ? "columns" : "rows"} with{" "}
              <span className="text-orange-400 font-medium">
                {Math.round(config.overlapRatio * 100)}%
              </span>{" "}
              overlap
            </p>
          </div>
        </div>
      </div>

      {/* Split button */}
      {hasFile && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onSplit}
            disabled={loading}
            className="btn btn-lg bg-orange-500 hover:bg-orange-400 border-2 border-orange-700 text-white rounded-xl px-12 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,0.7)] hover:-translate-y-0.5 active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_rgba(234,88,12,0.7)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Splitting...
              </>
            ) : (
              <>
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
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                Split Image
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
