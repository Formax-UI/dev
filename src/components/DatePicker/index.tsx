import { Calendar } from 'lucide-react';
import { forwardRef } from 'react';
import DatePickerReact from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DatePickerProps } from '../../types';
import { cn } from '../../utils/cn';

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
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
            placeholder = 'Select date...',
            dateFormat = 'MM/dd/yyyy',
            showTimeSelect = false,
            minDate,
            maxDate,
            register,
            onChange,
            value,
            ...rest
        },
        ref
    ) => {
        const datePickerId = id || name;
        const hasError = !!error;

        return (
            <div className={cn('formax-datepicker-wrapper', className)}>
                {label && (
                    <label
                        htmlFor={datePickerId}
                        className={cn('formax-label', { required })}
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    <DatePickerReact
                        id={datePickerId}
                        name={name}
                        selected={value}
                        onChange={onChange || (() => { })}
                        dateFormat={dateFormat}
                        showTimeSelect={showTimeSelect}
                        minDate={minDate}
                        maxDate={maxDate}
                        disabled={disabled}
                        placeholderText={placeholder}
                        className={cn(
                            'formax-field pr-10',
                            {
                                'error': hasError,
                            }
                        )}
                        wrapperClassName="w-full"
                        {...rest}
                    />

                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                </div>

                {error && (
                    <p id={`${datePickerId}-error`} className="formax-error">
                        {error}
                    </p>
                )}

                {helpText && !error && (
                    <p id={`${datePickerId}-help`} className="formax-help">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker'; 