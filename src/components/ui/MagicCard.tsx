"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagicCardProps {
    children: React.ReactNode;
    className?: string;
    gradientSize?: number;
    gradientColor?: string;
    gradientOpacity?: number;
    onClick?: () => void;
}

export function MagicCard({
    children,
    className,
    gradientSize = 200,
    gradientColor = "#FDB81320",
    gradientOpacity = 0.3,
    onClick
}: MagicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
        },
        []
    );

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
    };

    // Calculate 3D rotation based on mouse position
    const getRotation = useCallback(() => {
        if (!cardRef.current || !isHovered) return { rotateX: 0, rotateY: 0 };

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Normalize mouse position to -1 to 1 range
        const normalizedX = (mousePosition.x - centerX) / centerX;
        const normalizedY = (mousePosition.y - centerY) / centerY;

        // rotateY: positive when mouse is on right, negative on left
        // rotateX: negative when mouse is on bottom, positive on top
        const rotateY = normalizedX * 6;  // Max 6 degrees
        const rotateX = -normalizedY * 6; // Inverted for natural 3D effect

        return { rotateX, rotateY };
    }, [isHovered, mousePosition]);

    const { rotateX, rotateY } = getRotation();

    return (
        <div style={{ perspective: "1000px" }}>
            <motion.div
                ref={cardRef}
                className={cn("relative", className)}
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                animate={{
                    rotateX: rotateX,
                    rotateY: rotateY,
                    scale: isHovered ? 1.02 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                }}
                style={{
                    transformStyle: "preserve-3d",
                }}
            >
                {children}

                {/* Subtle gradient glow on hover */}
                {isHovered && (
                    <div
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        style={{
                            opacity: gradientOpacity,
                            background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 80%)`,
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
}
