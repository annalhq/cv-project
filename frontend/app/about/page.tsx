import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const developerContributions = [
  {
    name: "Annalhq Shaikh",
    role: "A13",
    contribution:
      "Designed the end-to-end stitching flow, from upload orchestration to final panorama output handling, along with SIFT keypoint extraction and matching logic.",
  },
  {
    name: "Aryan Nakil",
    role: "A23",
    contribution:
      "Implemented keypoint extraction and robust correspondence filtering to improve alignment quality.",
  },
  {
    name: "Atharva Kulkarni",
    role: "A38",
    contribution:
      "Built the interactive UI flow for splitter and pipeline tools with clear step-by-step feedback.",
  },
];

const algorithmsUsed = [
  "SIFT (Scale-Invariant Feature Transform) for stable keypoint detection and descriptors",
  "FLANN / KNN matching for fast descriptor correspondence",
  "RANSAC-based homography estimation for outlier rejection",
  "Perspective warping for geometric alignment",
  "Multi-image blending for smoother panorama seams",
];

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />

      <section className="flex-1 w-full px-6 md:px-12 lg:px-20 py-8 md:py-14 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <h1 className="flex flex-col text-5xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.05] mb-8">
            <span className="font-eloquia text-white tracking-tight">
              Built by people.
            </span>
            <span className="font-eurotypo text-orange-500 pr-4">
              Driven by algorithms.
            </span>
          </h1>

          <p className="text-white/45 text-lg md:text-xl leading-relaxed mb-12 font-light max-w-3xl">
            This panorama platform was crafted as a collaborative computer
            vision project, combining strong algorithmic foundations with a
            crisp user-focused interface.
          </p>

          <div className="mb-14">
            <h2 className="font-eloquia text-3xl md:text-4xl text-white mb-6 tracking-tight">
              Developer Contributions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {developerContributions.map((developer) => (
                <article
                  key={developer.name}
                  className="rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm hover:border-orange-500/40 transition-colors duration-300"
                >
                  <h3 className="font-eloquia text-2xl text-white tracking-tight">
                    {developer.name}
                  </h3>
                  <p className="text-orange-400/90 text-sm uppercase tracking-widest mt-1 mb-4">
                    {developer.role}
                  </p>
                  <p className="text-white/65 leading-relaxed">
                    {developer.contribution}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-eloquia text-3xl md:text-4xl text-white mb-6 tracking-tight">
              Algorithms Used
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 md:p-8 backdrop-blur-sm">
              <ol className="space-y-4 text-white/75">
                {algorithmsUsed.map((algorithm, index) => (
                  <li
                    key={algorithm}
                    className="flex items-start gap-3 leading-relaxed"
                  >
                    <span
                      className="mt-0.5 min-w-6 text-orange-500 font-mono text-sm tabular-nums"
                      aria-hidden="true"
                    >
                      {index + 1}.
                    </span>
                    <span>{algorithm}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
