"use client";

import { Columns2, Rows2, ChevronDown, Settings } from "lucide-react";

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
  const directionOptions: {
    value: "vertical" | "horizontal";
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "vertical",
      label: "Vertical",
      sublabel: "Slices image into columns",
      icon: <Columns2 className="w-4 h-4" />,
    },
    {
      value: "horizontal",
      label: "Horizontal",
      sublabel: "Slices image into rows",
      icon: <Rows2 className="w-4 h-4" />,
    },
  ];

  const selected = directionOptions.find((o) => o.value === config.direction)!;

  return (
    <div className="mb-10">
      <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
            Split Configuration
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Number of chunks — stepper input */}
          <div className="form-control w-full">
            <label className="label" htmlFor="splitter-chunks">
              <span className="label-text text-white/50 text-sm">
                Number of Chunks
              </span>
            </label>
            <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-white/10 bg-white/5 focus-within:border-orange-500/50 transition-colors">
              <button
                type="button"
                aria-label="Decrease chunks"
                onClick={() =>
                  onChange({
                    ...config,
                    chunks: Math.max(2, config.chunks - 1),
                  })
                }
                className="px-3 py-2 text-white/50 hover:text-orange-400 hover:bg-white/5 transition-colors text-lg font-bold select-none"
              >
                −
              </button>
              <input
                id="splitter-chunks"
                type="number"
                min={2}
                max={20}
                value={config.chunks}
                onChange={(e) =>
                  onChange({
                    ...config,
                    chunks: Math.max(
                      2,
                      Math.min(20, parseInt(e.target.value) || 2),
                    ),
                  })
                }
                className="w-full bg-transparent text-white text-center focus:outline-none py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
              />
              <button
                type="button"
                aria-label="Increase chunks"
                onClick={() =>
                  onChange({
                    ...config,
                    chunks: Math.min(20, config.chunks + 1),
                  })
                }
                className="px-3 py-2 text-white/50 hover:text-orange-400 hover:bg-white/5 transition-colors text-lg font-bold select-none"
              >
                +
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt text-white/25">
                Between 2 – 20
              </span>
            </label>
          </div>

          {/* Direction — DaisyUI dropdown */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-white/50 text-sm">
                Split Direction
              </span>
            </label>
            <details className="dropdown w-full">
              <summary className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer hover:border-orange-500/40 transition-colors list-none [&::-webkit-details-marker]:hidden focus:outline-none focus:border-orange-500/50">
                <span className="flex items-center gap-2 text-sm">
                  <span className="text-orange-400">{selected.icon}</span>
                  <span>{selected.label}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/40 text-xs">
                    {selected.sublabel}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
              </summary>
              <ul className="menu dropdown-content bg-neutral border border-white/10 rounded-xl z-10 w-full p-1.5 shadow-xl mt-1">
                {directionOptions.map((opt) => (
                  <li key={opt.value}>
                    <a
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                        config.direction === opt.value
                          ? "bg-orange-500/20 text-orange-400"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => {
                        onChange({ ...config, direction: opt.value });
                        // close the details element
                        (document.activeElement as HTMLElement)?.blur();
                      }}
                    >
                      <span
                        className={
                          config.direction === opt.value
                            ? "text-orange-400"
                            : "text-white/40"
                        }
                      >
                        {opt.icon}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-xs text-white/30">
                          {opt.sublabel}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            <label className="label">
              <span className="label-text-alt text-white/25">
                {config.direction === "vertical"
                  ? "Slices image into columns"
                  : "Slices image into rows"}
              </span>
            </label>
          </div>

          {/* Overlap ratio — unchanged */}
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
                  {Array.from({ length: Math.min(config.chunks, 6) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-4 h-10 bg-orange-500/30 border border-orange-500/50 rounded-sm"
                        style={{ opacity: 0.4 + (i / config.chunks) * 0.6 }}
                      />
                    ),
                  )}
                  {config.chunks > 6 && (
                    <span className="text-white/30 text-xs self-center ml-1">
                      +{config.chunks - 6}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {Array.from({ length: Math.min(config.chunks, 6) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-14 h-3 bg-orange-500/30 border border-orange-500/50 rounded-sm"
                        style={{ opacity: 0.4 + (i / config.chunks) * 0.6 }}
                      />
                    ),
                  )}
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
              <span className="text-orange-400 font-medium">
                {config.chunks}
              </span>{" "}
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
