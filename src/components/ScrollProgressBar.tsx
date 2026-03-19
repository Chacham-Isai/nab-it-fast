import { motion, useScroll, useSpring } from "framer-motion";
import { useLocation } from "react-router-dom";

const ScrollProgressBar = () => {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  if (pathname === "/") return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60]"
      style={{ scaleX, transformOrigin: "0%", background: "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--nab-purple)))" }}
    />
  );
};

export default ScrollProgressBar;
