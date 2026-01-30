import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    leftIcon?: ReactNode;
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
        primary: 'bg-[#FDB813] hover:bg-[#FFCE3D] text-black font-bold transition-all',
        secondary: 'liquid-glass-subtle text-zinc-200 hover:text-white',
        danger: 'bg-red-600/80 hover:bg-red-500 text-white backdrop-blur-sm',
        ghost: 'bg-transparent hover:bg-white/5 text-zinc-300',
    };

    return (
        <button
            className={clsx(
                'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
            {children}
        </button>
    );
};

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={clsx(
            'w-full bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#FDB813]/50 transition-all',
            className
        )}
        {...props}
    />
);

export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        className={clsx(
            'w-full bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-[#FDB813]/50 transition-all appearance-none cursor-pointer',
            className
        )}
        {...props}
    >
        {children}
    </select>
);
