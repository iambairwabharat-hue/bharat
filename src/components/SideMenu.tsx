import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../context/AudioContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { name: 'HOME', href: '/' },
  { name: 'SOCIAL MEDIA', href: '/social.html' },
  { name: 'WEBSITE', href: '/landscape.html' },
  { name: 'PREVIEW 3D', href: '/preview-3d' },
];

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { playHover, playClick } = useAudio();

  const handleClose = () => {
    playClick();
    onClose();
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
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            onClick={handleClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-white z-[100] flex flex-col justify-center px-12"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              onMouseEnter={playHover}
              className="absolute top-8 right-8 w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
            >
              <div className="w-8 h-[2px] bg-black rotate-45 translate-y-[4px] group-hover:bg-orange-500 transition-colors"></div>
              <div className="w-8 h-[2px] bg-black -rotate-45 -translate-y-[4px] group-hover:bg-orange-500 transition-colors"></div>
            </button>

            {/* Links */}
            <div className="flex flex-col gap-6">
              {MENU_LINKS.map((link, i) => (
                <div key={link.name} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.25, 1, 0.25, 1],
                      delay: isOpen ? 0.2 + i * 0.05 : 0 
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={() => {
                        playClick();
                        onClose();
                      }}
                      onMouseEnter={playHover}
                      className="block text-black font-['Inter_Tight'] font-bold text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter hover:text-orange-500 transition-colors"
                    >
                      {link.name}
                    </a>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: isOpen ? 0.5 : 0 }}
              className="absolute bottom-12 left-12 text-black font-['Inter_Tight'] font-medium text-sm tracking-widest uppercase"
            >
              PRMPT © 2026
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

