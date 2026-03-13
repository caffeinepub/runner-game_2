// Pre-generated stable star positions for the welcome screen decorative background
export const STAR_POSITIONS = Array.from({ length: 60 }, (_, i) => ({
  id: `star-${i}`,
  width: ((i * 37 + 13) % 20) / 10 + 1,
  left: (i * 61 + 7) % 100,
  top: (i * 43 + 17) % 70,
  opacity: ((i * 29 + 5) % 7) / 10 + 0.1,
  duration: 2 + ((i * 17 + 3) % 30) / 10,
  delay: ((i * 23 + 11) % 30) / 10,
}));
