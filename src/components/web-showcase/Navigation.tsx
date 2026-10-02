interface NavigationProps {
  isProfileOpen: boolean;
  setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNewsletterOpen: boolean;
  setIsNewsletterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeView: string;
  setActiveView: React.Dispatch<React.SetStateAction<string>>;
}

export default function Navigation({
  isProfileOpen,
  setIsProfileOpen,
  isNewsletterOpen,
  setIsNewsletterOpen,
  activeView,
  setActiveView,
}: NavigationProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between px-6 py-6 md:px-12 md:py-8 text-white select-none">
      {/* Top Header */}
      <header className="flex items-start justify-between">
        <button
          onClick={() => {
            setIsProfileOpen(false);
            setIsNewsletterOpen(false);
          }}
          className="label pointer-events-auto tracking-tight hover:opacity-70 transition-opacity font-medium font-mono text-sm"
        >
          BHARAT BAIRWA
        </button>

        <button
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className="label pointer-events-auto hover:opacity-60 transition-opacity font-medium font-mono text-xs uppercase border border-white/20 px-3 py-1 rounded-full mr-16 md:mr-20"
          aria-expanded={isProfileOpen}
        >
          {isProfileOpen ? "Close" : "Profile"}
        </button>
      </header>

      {/* Bottom Bar */}
      <footer className="relative flex items-end justify-between">
        <nav className="label pointer-events-auto flex items-center space-x-2 font-mono text-xs uppercase" aria-label="Views">
          <button
            onClick={() => setActiveView("featured")}
            className={`transition-opacity ${
              activeView === "featured" ? "opacity-100 font-bold" : "opacity-40 hover:opacity-80"
            }`}
          >
            Featured
          </button>
          <span className="opacity-40">/</span>
          <button
            onClick={() => setActiveView("full")}
            className={`transition-opacity ${
              activeView === "full" ? "opacity-100 font-bold" : "opacity-40 hover:opacity-80"
            }`}
          >
            Full
          </button>
        </nav>

        <button
          onClick={() => setIsNewsletterOpen((prev) => !prev)}
          className="label pointer-events-auto hover:opacity-60 transition-opacity font-mono text-xs uppercase border border-white/20 px-3 py-1 rounded-full"
          aria-expanded={isNewsletterOpen}
        >
          {isNewsletterOpen ? "Close" : "Newsletter"}
        </button>
      </footer>
    </div>
  );
}
