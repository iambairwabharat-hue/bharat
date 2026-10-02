import { useState } from "react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md text-white">
      <div className="max-w-[32rem] w-full text-center space-y-6 bg-neutral-950 p-10 border border-white/10 rounded-2xl">
        <p className="text-base md:text-lg leading-relaxed font-light text-white/90">
          Subscribe to receiving occasional updates about new web experiments, 3D WebGL projects, and articles.
        </p>

        {submitted ? (
          <p className="label text-sm text-white/70 py-4 font-mono">Thank you for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-x-3 max-w-[26rem] mx-auto pt-2">
            <div className="relative flex-1 h-12 bg-white/10 rounded-full px-5 flex items-center border border-white/15 focus-within:border-white/50 transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 rounded-full bg-white text-black text-xs font-mono font-bold uppercase hover:bg-white/90 transition-colors flex items-center justify-center"
            >
              Join
            </button>
          </form>
        )}

        <div className="pt-4">
          <button
            onClick={onClose}
            className="label text-xs tracking-wider font-mono text-white/50 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
