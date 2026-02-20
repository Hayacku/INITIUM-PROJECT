import React from 'react';

/**
 * INITIUM Logo Component
 * 
 * Displays the INITIUM logo using pure SVG and CSS for a premium,
 * reliable look that fits the hexagonal design system.
 */
export const Logo = ({
    variant = 'default',
    size = 'md',
    className = '',
    onClick
}) => {
    // Size mappings
    const heightMap = {
        sm: 24,
        md: 32,
        lg: 48,
        xl: 64
    };

    const height = heightMap[size] || heightMap.md;

    return (
        <div
            className={`flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="relative flex items-center justify-center" style={{ height: `${height}px`, width: `${height}px` }}>
                {/* Hexagonal Backdrop */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">
                    <path
                        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                        fill="currentColor"
                        fillOpacity="0.1"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    {/* Inner Hex */}
                    <path
                        d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            <div className="flex flex-col leading-none">
                <span className={`font-black tracking-tighter text-foreground uppercase`} style={{ fontSize: `${height * 0.7}px` }}>
                    INITIUM
                </span>
                {variant !== 'icon-only' && size !== 'sm' && (
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/80 mt-1">
                        Collective
                    </span>
                )}
            </div>
        </div>
    );
};

export const LogoIcon = ({ size = 'md', className = '', onClick }) => {
    return (
        <Logo
            variant="icon-only"
            size={size}
            className={className}
            onClick={onClick}
        />
    );
};

export default Logo;
