'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
    Checkbox,
    DatePicker,
    FormError,
    FormProvider,
    MultiStepForm,
    RadioGroup,
    Select,
    SubmitButton,
    SwitchToggle,
    TextInput,
    Textarea,
} from 'formax-ui';

// Validation schema
const formSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    country: z.string().min(1, 'Please select a country'),
    interests: z.array(z.string()).min(1, 'Please select at least one interest'),
    contactMethod: z.string().min(1, 'Please select a contact method'),
    newsletter: z.boolean(),
    notifications: z.boolean(),
    terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

type FormData = z.infer<typeof formSchema>;

const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
];

const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' },
];

export default function PlaygroundPage() {
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            message: '',
            country: '',
            interests: [],
            contactMethod: '',
            newsletter: false,
            notifications: true,
            terms: false,
        },
    });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

    const onSubmit = async (data: FormData) => {
        console.log('Form Data:', data);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        alert('Form submitted successfully!');
    };

    const tabs = [
        { id: 'basic', label: 'Basic Components' },
        { id: 'advanced', label: 'Advanced Components' },
        { id: 'multistep', label: 'Multi-Step Form' },
    ];

    // Multi-step form steps
    const multiStepSteps = [
        {
            id: 'personal',
            title: 'Personal Info',
            description: 'Tell us about yourself',
            component: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextInput
                            label="First Name"
                            name="firstName"
                            placeholder="Enter your first name"
                            leftIcon={<User className="h-4 w-4" />}
                            required
                        />
                        <TextInput
                            label="Last Name"
                            name="lastName"
                            placeholder="Enter your last name"
                            required
                        />
                    </div>
                    <TextInput
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon={<Mail className="h-4 w-4" />}
                        required
                    />
                </div>
            ),
        },
        {
            id: 'preferences',
            title: 'Preferences',
            description: 'Your communication preferences',
            component: (
                <div className="space-y-6">
                    <Select
                        label="Country"
                        name="country"
                        options={countryOptions}
                        placeholder="Select your country"
                        required
                    />
                    <RadioGroup
                        label="Preferred Contact Method"
                        name="contactMethod"
                        options={contactMethods}
                        required
                    />
                    <div className="space-y-4">
                        <SwitchToggle
                            label="Email Notifications"
                            name="notifications"
                            helpText="Receive updates about new features"
                        />
                        <Checkbox
                            label="Subscribe to newsletter"
                            name="newsletter"
                        />
                    </div>
                </div>
            ),
        },
        {
            id: 'message',
            title: 'Message',
            description: 'Tell us more',
            component: (
                <div className="space-y-6">
                    <Textarea
                        label="Message"
                        name="message"
                        placeholder="Tell us what you think..."
                        autoResize
                        minRows={4}
                        required
                    />
                    <DatePicker
                        label="Preferred Contact Date"
                        name="contactDate"
                        placeholder="Select a date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                    />
                    <Checkbox
                        label="I agree to the terms and conditions"
                        name="terms"
                        required
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Formax UI Component Playground
                </h1>
                <p className="text-lg text-gray-600">
                    Explore all the beautiful and accessible form components in action.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-formax-500 text-formax-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && (
                <FormProvider formMethods={form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Basic Form Components
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextInput
                                        label="First Name"
                                        name="firstName"
                                        placeholder="Enter your first name"
                                        leftIcon={<User className="h-4 w-4" />}
                                        error={errors.firstName?.message}
                                        register={register('firstName')}
                                        required
                                    />
                                    <TextInput
                                        label="Last Name"
                                        name="lastName"
                                        placeholder="Enter your last name"
                                        error={errors.lastName?.message}
                                        register={register('lastName')}
                                        required
                                    />
                                </div>

                                <TextInput
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    leftIcon={<Mail className="h-4 w-4" />}
                                    error={errors.email?.message}
                                    register={register('email')}
                                    helpText="We'll never share your email"
                                    required
                                />

                                <Textarea
                                    label="Message"
                                    name="message"
                                    placeholder="Tell us what you think..."
                                    error={errors.message?.message}
                                    register={register('message')}
                                    autoResize
                                    minRows={3}
                                    maxRows={8}
                                    required
                                />

                                <Select
                                    label="Country"
                                    name="country"
                                    options={countryOptions}
                                    placeholder="Select your country"
                                    error={errors.country?.message}
                                    register={register('country')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Choice Components
                            </h2>

                            <div className="space-y-6">
                                <RadioGroup
                                    label="Preferred Contact Method"
                                    name="contactMethod"
                                    options={contactMethods}
                                    error={errors.contactMethod?.message}
                                    register={register('contactMethod')}
                                    direction="horizontal"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SwitchToggle
                                        label="Email Notifications"
                                        name="notifications"
                                        register={register('notifications')}
                                        helpText="Receive updates about new features"
                                        size="md"
                                    />

                                    <SwitchToggle
                                        label="Push Notifications"
                                        name="pushNotifications"
                                        size="sm"
                                        helpText="Get notified on your device"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Checkbox
                                        label="Subscribe to newsletter"
                                        name="newsletter"
                                        register={register('newsletter')}
                                        helpText="Monthly updates about new components"
                                    />
                                    <Checkbox
                                        label="I agree to the terms and conditions"
                                        name="terms"
                                        error={errors.terms?.message}
                                        register={register('terms')}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <FormError
                                message="Please fix the following errors:"
                                errors={Object.values(errors).map(error => error?.message || 'Unknown error')}
                            />
                        )}

                        <div className="flex justify-end">
                            <SubmitButton
                                loading={isSubmitting}
                                loadingText="Submitting..."
                                icon={<Send className="h-4 w-4" />}
                                size="lg"
                            >
                                Submit Form
                            </SubmitButton>
                        </div>
                    </form>
                </FormProvider>
            )}

            {activeTab === 'advanced' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Advanced Components
                    </h2>

                    <div className="space-y-8">
                        <DatePicker
                            label="Select Date"
                            name="date"
                            placeholder="Choose a date..."
                            value={selectedDate}
                            onChange={setSelectedDate}
                            helpText="Pick your preferred date"
                        />

                        <DatePicker
                            label="Date & Time"
                            name="datetime"
                            placeholder="Choose date and time..."
                            showTimeSelect
                            dateFormat="MM/dd/yyyy h:mm aa"
                        />

                        <Select
                            label="Multi-Select Example"
                            name="multiSelect"
                            options={[
                                { value: 'react', label: 'React' },
                                { value: 'vue', label: 'Vue' },
                                { value: 'angular', label: 'Angular' },
                                { value: 'svelte', label: 'Svelte' },
                            ]}
                            placeholder="Select frameworks..."
                            isMulti
                            isSearchable
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SubmitButton variant="primary" size="sm">
                                Primary Small
                            </SubmitButton>
                            <SubmitButton variant="secondary" size="md">
                                Secondary Medium
                            </SubmitButton>
                            <SubmitButton variant="outline" size="lg">
                                Outline Large
                            </SubmitButton>
                        </div>

                        <SubmitButton variant="primary" fullWidth loading>
                            Loading State
                        </SubmitButton>
                    </div>
                </div>
            )}

            {activeTab === 'multistep' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Multi-Step Form Example
                    </h2>

                    <MultiStepForm
                        steps={multiStepSteps}
                        onSubmit={async (data) => {
                            console.log('Multi-step form submitted:', data);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            alert('Multi-step form completed!');
                        }}
                        showProgress
                        allowSkipSteps={false}
                    />
                </div>
            )}
        </div>
    );
} 