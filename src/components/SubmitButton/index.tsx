import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { SubmitButtonProps } from '../../types';
import { cn } from '../../utils/cn';

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
    (
        {
            children,
            loading = false,
            loadingText = 'Loading...',
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            icon,
            disabled,
            className,
            ...rest
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                type="submit"
                disabled={isDisabled}
                className={cn(
                    'formax-btn',
                    {
                        'formax-btn-primary': variant === 'primary',
                        'formax-btn-secondary': variant === 'secondary',
                        'formax-btn-outline': variant === 'outline',
                        'formax-btn-sm': size === 'sm',
                        'formax-btn-lg': size === 'lg',
                        'w-full': fullWidth,
                    },
                    className
                )}
                {...rest}
            >
                <div className="flex items-center justify-center">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {loadingText}
                        </>
                    ) : (
                        <>
                            {icon && <span className="mr-2">{icon}</span>}
                            {children}
                        </>
                    )}
                </div>
            </button>
        );
    }
);

SubmitButton.displayName = 'SubmitButton'; 