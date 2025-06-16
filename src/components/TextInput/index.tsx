import { forwardRef } from 'react';
import { TextInputProps } from '../../types';
import { cn } from '../../utils/cn';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
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
            type = 'text',
            placeholder,
            leftIcon,
            rightIcon,
            register,
            ...rest
        },
        ref
    ) => {
        const inputId = id || name;
        const hasError = !!error;

        return (
            <div className={cn('formax-text-input-wrapper', className)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn('formax-label', { required })}
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 sm:text-sm">
                                {leftIcon}
                            </span>
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={type}
                        id={inputId}
                        name={name}
                        placeholder={placeholder}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? `${inputId}-error` :
                                helpText ? `${inputId}-help` : undefined
                        }
                        className={cn(
                            'formax-field',
                            {
                                'pl-10': leftIcon,
                                'pr-10': rightIcon,
                                'error': hasError,
                            }
                        )}
                        {...(register ? register : {})}
                        {...rest}
                    />

                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 sm:text-sm">
                                {rightIcon}
                            </span>
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="formax-error">
                        {error}
                    </p>
                )}

                {helpText && !error && (
                    <p id={`${inputId}-help`} className="formax-help">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }
);

TextInput.displayName = 'TextInput'; 