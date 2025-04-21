
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface BirdProps {
  gameStarted: boolean;
  position: number;
  rotation: number;
  gameOver: boolean;
}

export const Bird = ({ gameStarted, position, rotation, gameOver }: BirdProps) => {
  return (
    <div
      className={cn(
        "absolute left-1/4 w-8 h-8 bg-yellow-400 rounded-full transition-transform duration-200",
        "border-2 border-yellow-600",
        "before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-1 before:left-1",
        "after:content-[''] after:absolute after:w-4 after:h-2 after:bg-orange-500 after:right-0 after:-rotate-45",
      )}
      style={{
        transform: `translateY(${position}px) rotate(${rotation}deg)`,
        transition: gameStarted ? 'transform 0.2s' : 'none'
      }}
    />
  );
};
