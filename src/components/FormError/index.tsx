import { AlertCircle } from 'lucide-react';
import React from 'react';
import { FormErrorProps } from '../../types';
import { cn } from '../../utils/cn';

export const FormError: React.FC<FormErrorProps> = ({
    message,
    errors,
    className,
}) => {
    if (!message && (!errors || errors.length === 0)) {
        return null;
    }

    return (
        <div className={cn(
            'bg-red-50 border border-red-200 rounded-md p-4',
            className
        )}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                        {message || 'There were errors with your submission'}
                    </h3>
                    {errors && errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc pl-5 space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

FormError.displayName = 'FormError'; 