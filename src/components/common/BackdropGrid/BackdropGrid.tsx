"use client";

import { cubicBezier, motion } from "framer-motion";
import React from "react";

interface BackdropGridProps {
  columns: number;
  rows: number;
  length: number;
}

export const BackdropGrid: React.FC<BackdropGridProps> = ({
  columns,
  rows,
  length,
}) => {
  return (
    <div
      className="absolute top-0 grid h-full w-full"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <motion.div
          key={index}
          whileHover={{
            backgroundColor: "oklch(0.4341 0.0392 41.9938 / 0.05)",
            transition: { duration: 0.5 },
          }}
          transition={{
            duration: 0.5,
            ease: cubicBezier(0.7, 0.1, 0.01, 1),
            delay: 0.5,
          }}
          className="border-primary/3 dark:border-primary/1 h-full w-full border"
        />
      ))}
    </div>
  );
};
