import { ChevronDown } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { SelectOption, SelectProps } from '../../types';
import { cn } from '../../utils/cn';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
            options,
            placeholder = 'Select an option...',
            isSearchable = false,
            isMulti = false,
            isAsync = false,
            loadOptions,
            register,
            ...rest
        },
        ref
    ) => {
        const selectId = id || name;
        const hasError = !!error;
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
        const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
        const [loading, setLoading] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const availableOptions = isAsync ? asyncOptions : options;
        const filteredOptions = isSearchable
            ? availableOptions.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : availableOptions;

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        useEffect(() => {
            if (!isAsync || !loadOptions) {
                return;
            }

            let isCurrent = true;
            setLoading(true);

            loadOptions(searchTerm)
                .then((loadedOptions) => {
                    if (isCurrent) {
                        setAsyncOptions(loadedOptions);
                    }
                })
                .finally(() => {
                    if (isCurrent) {
                        setLoading(false);
                    }
                });

            return () => {
                isCurrent = false;
            };
        }, [isAsync, loadOptions, searchTerm]);

        const handleOptionSelect = (option: SelectOption) => {
            if (isMulti) {
                const isSelected = selectedOptions.find(selected => selected.value === option.value);
                if (isSelected) {
                    setSelectedOptions(selectedOptions.filter(selected => selected.value !== option.value));
                } else {
                    setSelectedOptions([...selectedOptions, option]);
                }
            } else {
                setSelectedOptions([option]);
                setIsOpen(false);
            }
        };

        return (
            <div className={cn('formax-select-wrapper', className)}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className={cn('formax-label', { required })}
                    >
                        {label}
                    </label>
                )}

                <div className="relative" ref={dropdownRef}>
                    <select
                        ref={ref}
                        id={selectId}
                        name={name}
                        className="sr-only"
                        disabled={disabled}
                        multiple={isMulti}
                        aria-invalid={hasError}
                        {...(register ? register : {})}
                        {...rest}
                    >
                        {selectedOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            'formax-field text-left flex items-center justify-between',
                            {
                                'error': hasError,
                            }
                        )}
                    >
                        <span className="block truncate">
                            {selectedOptions.length === 0 ? placeholder :
                                isMulti ? `${selectedOptions.length} selected` : selectedOptions[0].label}
                        </span>
                        <ChevronDown className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            { 'rotate-180': isOpen }
                        )} />
                    </button>

                    {isOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            {isSearchable && (
                                <div className="p-2">
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-formax-500"
                                    />
                                </div>
                            )}

                            {loading && (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    Loading...
                                </div>
                            )}

                            {filteredOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={option.disabled}
                                    className={cn(
                                        'w-full text-left px-3 py-2 text-sm hover:bg-gray-100',
                                        {
                                            'opacity-50 cursor-not-allowed': option.disabled,
                                            'bg-formax-50 text-formax-700': selectedOptions.some(selected => selected.value === option.value),
                                        }
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="formax-error">{error}</p>
                )}

                {helpText && !error && (
                    <p className="formax-help">{helpText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
