import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageSplitter from "../components/ImageSplitter";

export const metadata = {
  title: "Image Splitter | Pano",
  description:
    "Split any image into overlapping chunks, then download them or send them directly to the stitching pipeline.",
};

export default function SplitterPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <section className="flex-1 pt-4 pb-12">
        <ImageSplitter />
      </section>
      <Footer />
    </main>
  );
}
