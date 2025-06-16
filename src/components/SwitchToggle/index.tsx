import { forwardRef } from 'react';
import { SwitchToggleProps } from '../../types';
import { cn } from '../../utils/cn';

export const SwitchToggle = forwardRef<HTMLInputElement, SwitchToggleProps>(
    (
        {
            label,
            name,
            error,
            required,
            disabled,
            className,
            id,
            helpText,
            onLabel = 'On',
            offLabel = 'Off',
            size = 'md',
            register,
            ...rest
        },
        ref
    ) => {
        const switchId = id || name;
        const hasError = !!error;

        const sizeClasses = {
            sm: {
                switch: 'h-5 w-9',
                thumb: 'h-4 w-4',
                translate: 'translate-x-4',
            },
            md: {
                switch: 'h-6 w-11',
                thumb: 'h-5 w-5',
                translate: 'translate-x-5',
            },
            lg: {
                switch: 'h-7 w-12',
                thumb: 'h-6 w-6',
                translate: 'translate-x-5',
            },
        };

        const currentSize = sizeClasses[size];

        return (
            <div className={cn('formax-switch-wrapper', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        {label && (
                            <label
                                htmlFor={switchId}
                                className={cn('formax-label', { required })}
                            >
                                {label}
                            </label>
                        )}

                        {helpText && !error && (
                            <p className="formax-help">
                                {helpText}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center ml-4">
                        <span className={cn(
                            'text-sm text-gray-500 mr-3',
                            { 'opacity-50': disabled }
                        )}>
                            {offLabel}
                        </span>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                ref={ref}
                                type="checkbox"
                                id={switchId}
                                name={name}
                                disabled={disabled}
                                aria-invalid={hasError}
                                aria-describedby={
                                    hasError ? `${switchId}-error` :
                                        helpText ? `${switchId}-help` : undefined
                                }
                                className="sr-only peer"
                                {...(register ? register : {})}
                                {...rest}
                            />

                            <div className={cn(
                                currentSize.switch,
                                'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-formax-300 rounded-full peer',
                                'peer-checked:after:translate-x-full peer-checked:after:border-white',
                                `after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all`,
                                currentSize.thumb,
                                'peer-checked:bg-formax-600',
                                {
                                    'opacity-50 cursor-not-allowed': disabled,
                                    'bg-red-200 peer-checked:bg-red-500': hasError,
                                }
                            )}
                            />
                        </label>

                        <span className={cn(
                            'text-sm text-gray-500 ml-3',
                            { 'opacity-50': disabled }
                        )}>
                            {onLabel}
                        </span>
                    </div>
                </div>

                {error && (
                    <p id={`${switchId}-error`} className="formax-error mt-2">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

SwitchToggle.displayName = 'SwitchToggle'; 