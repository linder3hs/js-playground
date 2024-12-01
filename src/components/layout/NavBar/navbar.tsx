import { Command, Github } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-[#1C2333] bg-[#0E1525]/80 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Command className="w-8 h-8 text-orange-500" />
            <span className="font-semibold text-xl">Playground</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/linder3hs/js-playground" target="_blank">
            <Github className="w-5 h-5" />
          </a>
          {/* <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors">
            Start Coding
          </button> */}
        </div>
      </div>
    </nav>
  );
}
