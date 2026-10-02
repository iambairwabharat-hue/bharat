import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../context/AudioContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { name: 'HOME', href: '/' },
  { name: 'WEB SHOWCASE', href: '/web' },
  { name: 'SOCIAL MEDIA', href: 'https://github.com/iambairwabharat-hue' },
  { name: 'WEBSITE', href: '/' },
  { name: '3D EXPERIENCE', href: '/preview-3d' },
];

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { playHover, playClick } = useAudio();

  const handleClose = () => {
    playClick();
    onClose();
  };

  const handleNavClick = (href: string) => {
    playClick();
    onClose();
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = href;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90]"
            onClick={handleClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[540px] bg-[#0a0a0a] text-white z-[100] flex flex-col justify-between p-10 md:p-16 border-l border-white/10"
          >
            {/* Header / Close Button */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
                NAVIGATION
              </span>
              <button 
                onClick={handleClose}
                onMouseEnter={playHover}
                data-cursor="CLOSE"
                className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer group rounded-full border border-white/10 hover:border-white/40 transition-colors"
              >
                <div className="w-4 h-[1px] bg-white rotate-45 translate-y-[1px] group-hover:scale-110 transition-transform"></div>
                <div className="w-4 h-[1px] bg-white -rotate-45 -translate-y-[1px] group-hover:scale-110 transition-transform"></div>
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-6 my-auto">
              {MENU_LINKS.map((link, i) => (
                <div key={link.name} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.16, 1, 0.3, 1],
                      delay: isOpen ? 0.15 + i * 0.04 : 0 
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }}
                      onMouseEnter={playHover}
                      data-cursor="OPEN →"
                      className="group flex items-center justify-between text-white font-['Inter_Tight'] font-extrabold text-3xl md:text-4xl uppercase tracking-tighter hover:text-white/70 transition-colors py-1"
                    >
                      <span className="group-hover:translate-x-3 transition-transform duration-300">
                        {link.name}
                      </span>
                      <span className="text-sm font-mono text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                        0{i + 1}
                      </span>
                    </a>
                  </motion.div>
                </div>
              ))}
            </div>
            
            {/* Footer metadata */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: isOpen ? 0.4 : 0 }}
              className="flex items-center justify-between pt-8 border-t border-white/10 text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase"
            >
              <span>BHARAT BAIRWA © 2026</span>
              <span>AHMEDABAD, IN</span>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
