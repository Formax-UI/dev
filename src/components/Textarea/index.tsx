import React, { forwardRef, useEffect, useRef } from 'react';
import { TextareaProps } from '../../types';
import { cn } from '../../utils/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
            placeholder,
            autoResize = false,
            minRows = 3,
            maxRows = 10,
            register,
            ...rest
        },
        ref
    ) => {
        const textareaId = id || name;
        const hasError = !!error;
        const internalRef = useRef<HTMLTextAreaElement>(null);
        const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

        const adjustHeight = () => {
            if (autoResize && textareaRef.current) {
                const textarea = textareaRef.current;
                textarea.style.height = 'auto';

                const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
                const minHeight = lineHeight * minRows;
                const maxHeight = lineHeight * maxRows;

                const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
                textarea.style.height = `${newHeight}px`;
            }
        };

        useEffect(() => {
            if (autoResize) {
                adjustHeight();
            }
        }, [autoResize]);

        return (
            <div className={cn('formax-textarea-wrapper', className)}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={cn('formax-label', { required })}
                    >
                        {label}
                    </label>
                )}

                <textarea
                    ref={textareaRef}
                    id={textareaId}
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={autoResize ? minRows : rest.rows || 3}
                    aria-invalid={hasError}
                    aria-describedby={
                        hasError ? `${textareaId}-error` :
                            helpText ? `${textareaId}-help` : undefined
                    }
                    className={cn(
                        'formax-field resize-none',
                        {
                            'error': hasError,
                            'resize-y': !autoResize,
                        }
                    )}
                    onInput={autoResize ? adjustHeight : undefined}
                    {...(register ? register : {})}
                    {...rest}
                />

                {error && (
                    <p id={`${textareaId}-error`} className="formax-error">
                        {error}
                    </p>
                )}

                {helpText && !error && (
                    <p id={`${textareaId}-help`} className="formax-help">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea'; 