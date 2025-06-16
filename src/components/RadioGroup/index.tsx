import { forwardRef } from 'react';
import { RadioGroupProps } from '../../types';
import { cn } from '../../utils/cn';

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
    (
        {
            label,
            name,
            error,
            required,
            disabled,
            className,
            helpText,
            options,
            direction = 'vertical',
            register,
        },
        ref
    ) => {
        const hasError = !!error;

        return (
            <fieldset
                ref={ref}
                className={cn('formax-radio-group-wrapper', className)}
                disabled={disabled}
            >
                {label && (
                    <legend className={cn('formax-label', { required })}>
                        {label}
                    </legend>
                )}

                <div className={cn(
                    'mt-2 space-y-2',
                    {
                        'flex flex-wrap gap-4': direction === 'horizontal',
                        'space-y-2': direction === 'vertical',
                    }
                )}>
                    {options.map((option, index) => {
                        const optionId = `${name}-${option.value}`;

                        return (
                            <div key={option.value} className="flex items-center">
                                <input
                                    type="radio"
                                    id={optionId}
                                    name={name}
                                    value={option.value}
                                    disabled={disabled || option.disabled}
                                    aria-invalid={hasError}
                                    aria-describedby={
                                        hasError ? `${name}-error` :
                                            helpText ? `${name}-help` : undefined
                                    }
                                    className={cn(
                                        'h-4 w-4 text-formax-600 border-gray-300 focus:ring-formax-500 focus:ring-2',
                                        {
                                            'border-red-500': hasError,
                                        }
                                    )}
                                    {...(register ? register : {})}
                                />

                                <label
                                    htmlFor={optionId}
                                    className={cn(
                                        'ml-3 block text-sm font-medium text-gray-700',
                                        {
                                            'opacity-50 cursor-not-allowed': disabled || option.disabled,
                                        }
                                    )}
                                >
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <p id={`${name}-error`} className="formax-error mt-2">
                        {error}
                    </p>
                )}

                {helpText && !error && (
                    <p id={`${name}-help`} className="formax-help mt-2">
                        {helpText}
                    </p>
                )}
            </fieldset>
        );
    }
);

RadioGroup.displayName = 'RadioGroup'; 