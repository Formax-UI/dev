import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { MultiStepFormProps } from '../../types';
import { cn } from '../../utils/cn';

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
    steps,
    onSubmit,
    showProgress = true,
    allowSkipSteps = false,
    className,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const canProceed = allowSkipSteps || completedSteps.has(currentStep);

    const handleNext = async () => {
        const step = steps[currentStep];

        if (step.validation) {
            setLoading(true);
            try {
                const isValid = await step.validation();
                if (!isValid) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        setCompletedSteps(prev => new Set([...prev, currentStep]));

        if (isLastStep) {
            await onSubmit({});
        } else {
            setCurrentStep(prev => prev + 1);
        }

        setLoading(false);
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        if (allowSkipSteps || stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
            setCurrentStep(stepIndex);
        }
    };

    return (
        <div className={cn('formax-multistep-form', className)}>
            {/* Progress Bar */}
            {showProgress && (
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 relative">
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(index)}
                                        disabled={!allowSkipSteps && index > currentStep && !completedSteps.has(index - 1)}
                                        className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                                            {
                                                'bg-formax-600 text-white': index === currentStep,
                                                'bg-green-500 text-white': completedSteps.has(index),
                                                'bg-gray-200 text-gray-500': index > currentStep && !completedSteps.has(index),
                                                'bg-gray-300 text-gray-700': index < currentStep && !completedSteps.has(index),
                                                'cursor-pointer hover:bg-formax-700': allowSkipSteps || index <= currentStep || completedSteps.has(index - 1),
                                                'cursor-not-allowed': !allowSkipSteps && index > currentStep && !completedSteps.has(index - 1),
                                            }
                                        )}
                                    >
                                        {completedSteps.has(index) ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </button>

                                    {index < steps.length - 1 && (
                                        <div className={cn(
                                            'flex-1 h-0.5 mx-4',
                                            {
                                                'bg-green-500': completedSteps.has(index),
                                                'bg-formax-600': index < currentStep,
                                                'bg-gray-200': index >= currentStep,
                                            }
                                        )} />
                                    )}
                                </div>

                                <div className="mt-2">
                                    <p className={cn(
                                        'text-sm font-medium',
                                        {
                                            'text-formax-600': index === currentStep,
                                            'text-green-600': completedSteps.has(index),
                                            'text-gray-500': index !== currentStep && !completedSteps.has(index),
                                        }
                                    )}>
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Step Content */}
            <div className="mb-8">
                {steps[currentStep]?.component}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={isFirstStep}
                    className={cn(
                        'inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-formax-500 focus:ring-offset-2',
                        {
                            'opacity-50 cursor-not-allowed': isFirstStep,
                        }
                    )}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={cn(
                        'inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-formax-600 border border-transparent rounded-md hover:bg-formax-700 focus:outline-none focus:ring-2 focus:ring-formax-500 focus:ring-offset-2',
                        {
                            'opacity-50 cursor-not-allowed': loading,
                        }
                    )}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : isLastStep ? (
                        'Submit'
                    ) : (
                        <>
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

MultiStepForm.displayName = 'MultiStepForm'; 