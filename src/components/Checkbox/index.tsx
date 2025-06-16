import { Check } from 'lucide-react';
import { forwardRef } from 'react';
import { CheckboxProps } from '../../types';
import { cn } from '../../utils/cn';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
            register,
            ...rest
        },
        ref
    ) => {
        const checkboxId = id || name;
        const hasError = !!error;

        return (
            <div className={cn('formax-checkbox-wrapper', className)}>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            ref={ref}
                            type="checkbox"
                            id={checkboxId}
                            name={name}
                            disabled={disabled}
                            aria-invalid={hasError}
                            aria-describedby={
                                hasError ? `${checkboxId}-error` :
                                    helpText ? `${checkboxId}-help` : undefined
                            }
                            className={cn(
                                'sr-only peer'
                            )}
                            {...(register ? register : {})}
                            {...rest}
                        />
                        <div className={cn(
                            'w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200',
                            'peer-checked:bg-formax-600 peer-checked:border-formax-600',
                            'peer-focus:ring-2 peer-focus:ring-formax-500 peer-focus:ring-offset-2',
                            {
                                'border-gray-300 bg-white': !hasError,
                                'border-red-500': hasError,
                                'opacity-50 cursor-not-allowed': disabled,
                            }
                        )}>
                            <Check className={cn(
                                'w-3 h-3 text-white transition-opacity duration-200',
                                'opacity-0 peer-checked:opacity-100'
                            )} />
                        </div>
                    </div>

                    {label && (
                        <div className="ml-3 text-sm">
                            <label
                                htmlFor={checkboxId}
                                className={cn('font-medium text-gray-700', {
                                    'cursor-not-allowed opacity-50': disabled,
                                })}
                            >
                                {label}
                                {required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${checkboxId}-error`} className="formax-error mt-2">
                        {error}
                    </p>
                )}

                {helpText && !error && (
                    <p id={`${checkboxId}-help`} className="formax-help mt-2">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox'; 