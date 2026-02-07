"use client";

import { cn } from "../../lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ShimmerButtonProps extends HTMLMotionProps<"button"> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Shimmer Button - кнопка с эффектом мерцания
 * Компонент Magic UI для премиальных CTA-кнопок
 */
export function ShimmerButton({
    shimmerColor = "#FDB813",
    shimmerSize = "0.1em",
    shimmerDuration = "2.5s",
    borderRadius = "12px",
    background = "rgba(0, 0, 0, 0.9)",
    className,
    children,
    ...props
}: ShimmerButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={
                {
                    "--shimmer-color": shimmerColor,
                    "--radius": borderRadius,
                    "--shimmer-size": shimmerSize,
                    "--shimmer-duration": shimmerDuration,
                    "--background": background,
                } as React.CSSProperties
            }
            className={cn(
                "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 font-medium text-white",
                "transform-gpu transition-transform duration-300 ease-in-out",
                "[background:var(--background)]",
                "[border-radius:var(--radius)]",
                "border border-[#FDB813]/30",
                className
            )}
            {...props}
        >
            {/* Spark container */}
            <div
                className={cn(
                    "absolute inset-0 overflow-visible [container-type:size]"
                )}
            >
                {/* Spark */}
                <div
                    className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]"
                    style={{
                        background: `linear-gradient(
              90deg,
              transparent 0%,
              var(--shimmer-color) 50%,
              transparent 100%
            )`,
                        opacity: 0.3,
                    }}
                />
            </div>

            {/* Backdrop */}
            <div
                className={cn(
                    "absolute -z-20 [background:var(--background)] [border-radius:var(--radius)] [inset:var(--shimmer-size)]"
                )}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
}

export default ShimmerButton;
