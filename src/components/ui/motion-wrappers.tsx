"use client";

import { motion } from "framer-motion";

export function FadeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 300, damping: 24 }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.12, delayChildren: 0.15 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 300, damping: 24 }
        },
      }}
      whileHover={{ y: -3, scale: 1.005, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className={`glass-panel rounded-lg p-6 ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}
