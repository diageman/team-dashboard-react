"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";

interface NumberTickerProps {
    value: number;
    direction?: "up" | "down";
    delay?: number;
    className?: string;
    decimalPlaces?: number;
    suffix?: string;
    prefix?: string;
}

/**
 * Number Ticker - анимированный счётчик чисел
 * Компонент Magic UI для плавной анимации числовых значений
 */
export function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    className,
    decimalPlaces = 0,
    suffix = "",
    prefix = "",
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(direction === "down" ? 0 : value);
            }, delay * 1000);
        }
    }, [motionValue, isInView, delay, value, direction]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent =
                    prefix +
                    Intl.NumberFormat("ru-RU", {
                        minimumFractionDigits: decimalPlaces,
                        maximumFractionDigits: decimalPlaces,
                    }).format(Number(latest.toFixed(decimalPlaces))) +
                    suffix;
            }
        });

        return () => unsubscribe();
    }, [springValue, decimalPlaces, suffix, prefix]);

    return (
        <span
            ref={ref}
            className={cn(
                "inline-block tabular-nums tracking-wider",
                className
            )}
        >
            {prefix}0{suffix}
        </span>
    );
}

export default NumberTicker;
