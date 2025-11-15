// src/components/CollapseContainer.tsx
import React from 'react';
import { cn } from '@/utils'; // 假设的工具函数

interface CollapseContainerProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapseContainer: React.FC<CollapseContainerProps> = ({
  show,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        show
          ? 'max-h-[900px] opacity-100 visibility-visible'
          : 'max-h-0 opacity-0 visibility-hidden',
        className,
      )}
    >
      {children}
    </div>
  );
};