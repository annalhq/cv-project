import { Binary } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full px-6 py-8 md:px-12 lg:px-20 border-t border-white/5 mt-auto flex flex-col items-center justify-center text-sm text-white/30">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center">
        <p className="text-white/30 text-sm italic font-light tracking-wider flex items-center gap-2">
          <span>created with</span>
          <Binary className="h-4 w-4 text-orange-500" aria-hidden="true" />
          <span>by annalhq</span>
        </p>
      </div>
    </footer>
  );
}
