interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md text-white">
      <div className="max-w-[42rem] w-full text-center space-y-6 bg-neutral-950 p-10 border border-white/10 rounded-2xl">
        <p className="text-lg md:text-xl leading-relaxed font-light text-white/90">
          BHARAT BAIRWA — Creative Developer & Designer building visually rich, motion-driven websites and 3D web applications.
          Specializing in front-end architecture, WebGL shaders, interactive animation, WordPress & Shopify development.
        </p>

        <p className="label opacity-50 pt-2 text-xs font-mono tracking-wider uppercase">
          Sabarmati, Ahmedabad, India — Available for global projects
        </p>

        <ul className="flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 font-mono text-xs uppercase">
          <li>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="label hover:opacity-60 transition-opacity"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="label hover:opacity-60 transition-opacity"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="mailto:iambairwabharat@gmail.com"
              className="label hover:opacity-60 transition-opacity"
            >
              Email
            </a>
          </li>
        </ul>

        <div className="pt-6">
          <button
            onClick={onClose}
            className="label px-6 py-2.5 rounded-full border border-white/20 hover:border-white text-xs font-mono tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
