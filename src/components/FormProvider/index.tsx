import React from 'react';
import { FormProviderProps } from '../../types';
import { cn } from '../../utils/cn';

export const FormProvider: React.FC<FormProviderProps> = ({
    children,
    formMethods,
    className,
}) => {
    // If React Hook Form methods are provided, wrap with FormProvider
    if (formMethods && formMethods.formState) {
        try {
            // Try to import React Hook Form dynamically without eval
            const rhf = require('react-hook-form');
            const RHFFormProvider = rhf.FormProvider;

            if (RHFFormProvider) {
                return (
                    <RHFFormProvider {...formMethods}>
                        <div className={cn('formax-form-provider', className)}>
                            {children}
                        </div>
                    </RHFFormProvider>
                );
            }
        } catch (error) {
            console.warn('React Hook Form not found. Using basic wrapper.');
        }
    }

    // Otherwise, just provide a wrapper div
    return (
        <div className={cn('formax-form-provider', className)}>
            {children}
        </div>
    );
}; 