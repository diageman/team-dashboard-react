import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Types need to handle both standard HTML props and motion props
interface ButtonProps extends React.ComponentProps<typeof motion.button> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    leftIcon?: any;
}

export const Button = ({
    children,
    variant = 'primary',
    isLoading,
    leftIcon,
    className,
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'bg-[#FDB813] hover:bg-[#FFCE3D] text-black font-bold border border-transparent',
        secondary: 'liquid-glass-subtle text-zinc-200 hover:text-white border border-white/5',
        danger: 'bg-red-600/80 hover:bg-red-500 text-white backdrop-blur-sm border border-red-500/30',
        ghost: 'bg-transparent hover:bg-white/5 text-zinc-300 border border-transparent',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
                'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20',
                variants[variant],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
            {children}
        </motion.button>
    );
};

export const Input = ({ className, ...props }: React.ComponentProps<typeof motion.input>) => (
    <motion.input
        whileFocus={{ scale: 1.01, borderColor: 'rgba(253, 184, 19, 0.5)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={clsx(
            'w-full bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all shadow-inner shadow-black/20',
            className
        )}
        {...props}
    />
);

export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <motion.div whileHover={{ scale: 1.01 }}>
        <select
            className={clsx(
                'w-full bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-[#FDB813]/50 transition-all appearance-none cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </select>
    </motion.div>
);
