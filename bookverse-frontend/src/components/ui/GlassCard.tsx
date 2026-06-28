import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
        relative backdrop-blur-xl bg-white/10 
        border border-white/20 rounded-2xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
        p-8 transition-all duration-300 
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] 
        hover:bg-white/15
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default GlassCard;