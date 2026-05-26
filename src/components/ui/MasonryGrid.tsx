"use client";

import React, { useEffect, useState, useMemo } from "react";

interface MasonryGridProps {
  children: React.ReactNode;
  breakpoints: Record<number, number>; // e.g. { 640: 2, 768: 3, 1024: 4, 1280: 5, 1536: 6 }
  defaultCols?: number;
}

export function MasonryGrid({ children, breakpoints, defaultCols = 2 }: MasonryGridProps) {
  const [cols, setCols] = useState(defaultCols);

  useEffect(() => {
    const updateCols = () => {
      let newCols = defaultCols;
      // Sort breakpoints descending
      const sortedKeys = Object.keys(breakpoints)
        .map(Number)
        .sort((a, b) => b - a);
        
      for (const bp of sortedKeys) {
        if (window.innerWidth >= bp) {
          newCols = breakpoints[bp];
          break;
        }
      }
      setCols(newCols);
    };
    
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, [breakpoints, defaultCols]);

  const columns = useMemo(() => {
    const colsArray: React.ReactNode[][] = Array.from({ length: cols }, () => []);
    // Ensure we handle Fragments and nested arrays correctly by flattening
    const flatChildren = React.Children.toArray(children);
    
    flatChildren.forEach((child, index) => {
      colsArray[index % cols].push(child);
    });
    return colsArray;
  }, [children, cols]);

  return (
    <div className="flex w-full items-start gap-4 sm:gap-6">
      {columns.map((col, i) => (
        <div key={i} className="flex-1 flex flex-col gap-4 sm:gap-6">
          {col}
        </div>
      ))}
    </div>
  );
}
