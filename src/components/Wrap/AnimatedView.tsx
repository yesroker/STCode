// src/components/AnimatedView.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // 假设的工具函数


interface AnimatedViewProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  show,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        // 高度动画
        'overflow-hidden transition-[max-height] duration-300 ease-in-out',
        show ? 'max-h-[900px]' : 'max-h-0',
        className,
      )}
    >
      <div
        className={cn(
          // 不透明度动画
          'transition-opacity duration-100 ease-in-out',
          show ? 'opacity-100 delay-100' : 'opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
};