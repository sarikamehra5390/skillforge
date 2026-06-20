import React from 'react';
import { cn } from '../../utils/cn';

const GlassCard = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "companion-card p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
