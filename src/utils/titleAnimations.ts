// Shared animation utilities for section titles

/**
 * Scramble text effect — rapidly cycles through random chars before
 * settling on the real character. Gives a "decoding" feel.
 */
export function scrambleText(
  element: HTMLElement,
  finalText: string,
  duration = 1.0,
  onComplete?: () => void
) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
  const totalFrames = Math.round(duration * 60);
  let frame = 0;

  const tick = () => {
    frame++;
    const progress = frame / totalFrames;

    element.textContent = finalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        // Reveal each character progressively from left
        const revealAt = i / finalText.replace(/ /g, '').length;
        if (progress > revealAt + 0.15) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    if (frame < totalFrames) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = finalText;
      onComplete?.();
    }
  };

  requestAnimationFrame(tick);
}

/**
 * Magnetic letter hover — letters repel from cursor on hover.
 * Attach to a container element with .mag-letter children.
 */
export function attachMagneticLetters(container: HTMLElement, strength = 0.3) {
  const letters = container.querySelectorAll<HTMLElement>('.mag-letter');
  const cleanups: (() => void)[] = [];

  letters.forEach((letter) => {
    const onMove = (e: MouseEvent) => {
      const rect = letter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 80;
      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * strength * 30;
        letter.style.transform = `translate(${(dx / dist) * force}px, ${(dy / dist) * force}px)`;
      } else {
        letter.style.transform = '';
      }
    };
    const onLeave = () => { letter.style.transform = ''; };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    });
  });

  return () => cleanups.forEach(fn => fn());
}
