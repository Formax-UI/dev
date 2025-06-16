# Formax UI

🧩 **A focused UI component library for building beautiful and accessible forms in React.**

[![npm version](https://img.shields.io/npm/v/formax-ui.svg)](https://www.npmjs.com/package/formax-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/formax-ui.svg)](https://www.npmjs.com/package/formax-ui)

## ✨ Features

- **🎯 Forms-focused**: Dedicated to solving form-related UI challenges
- **♿ Accessible**: Built with ARIA standards and keyboard navigation
- **🎨 Beautiful**: Modern design with Tailwind CSS
- **🔧 Flexible**: Works seamlessly with React Hook Form, Formik, and standalone
- **📱 Responsive**: Mobile-first design approach
- **🧩 Composable**: Mix and match components as needed
- **🚀 TypeScript**: Full TypeScript support with comprehensive types
- **🎪 Multi-step**: Built-in wizard component for complex forms

## 📦 Installation

```bash
npm install formax-ui
```

### Peer Dependencies

Make sure you have the required peer dependencies:

```bash
npm install react react-dom
```

### Optional Dependencies (for enhanced functionality)

```bash
# For React Hook Form integration
npm install react-hook-form

# For form validation
npm install @hookform/resolvers zod
```

## 🚀 Quick Start

```jsx
import { TextInput, SubmitButton } from 'formax-ui';

function MyForm() {
  return (
    <form>
      <TextInput
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />
      <SubmitButton>Submit</SubmitButton>
    </form>
  );
}
```

## 📚 Components

### Core Input Components

#### `<TextInput />`
Versatile text input with icons, validation, and accessibility features.

```jsx
import { TextInput } from 'formax-ui';
import { Mail } from 'lucide-react';

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
```

#### `<Textarea />`
Auto-resizing textarea with customizable rows.

```jsx
import { Textarea } from 'formax-ui';

<Textarea
  label="Message"
  name="message"
  placeholder="Tell us what you think..."
  autoResize
  minRows={3}
  maxRows={8}
  required
/>
```

#### `<Select />`
Feature-rich dropdown with search, multi-select, and async loading.

```jsx
import { Select } from 'formax-ui';

const options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
];

<Select
  label="Country"
  name="country"
  options={options}
  placeholder="Select your country"
  isSearchable
  required
/>
```

### Choice Components

#### `<Checkbox />`
Custom-styled checkbox with validation support.

```jsx
import { Checkbox } from 'formax-ui';

<Checkbox
  label="I agree to the terms and conditions"
  name="terms"
  required
/>
```

#### `<RadioGroup />`
Accessible radio button group with flexible layouts.

```jsx
import { RadioGroup } from 'formax-ui';

const options = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
];

<RadioGroup
  label="Preferred Contact Method"
  name="contactMethod"
  options={options}
  direction="horizontal"
  required
/>
```

#### `<SwitchToggle />`
Modern toggle switch with customizable sizes.

```jsx
import { SwitchToggle } from 'formax-ui';

<SwitchToggle
  label="Email Notifications"
  name="notifications"
  size="md"
  onLabel="On"
  offLabel="Off"
  helpText="Receive updates about new features"
/>
```

### Advanced Components

#### `<DatePicker />`
Date and time picker with extensive customization options.

```jsx
import { DatePicker } from 'formax-ui';

<DatePicker
  label="Select Date"
  name="date"
  placeholder="Choose a date..."
  dateFormat="MM/dd/yyyy"
  showTimeSelect
  minDate={new Date()}
/>
```

#### `<MultiStepForm />`
Built-in wizard component for complex multi-step forms.

```jsx
import { MultiStepForm } from 'formax-ui';

const steps = [
  {
    id: 'personal',
    title: 'Personal Info',
    description: 'Tell us about yourself',
    component: <PersonalInfoStep />,
    validation: async () => {
      // Custom validation logic
      return isStepValid;
    }
  },
  // ... more steps
];

<MultiStepForm
  steps={steps}
  onSubmit={handleSubmit}
  showProgress
  allowSkipSteps={false}
/>
```

### Utility Components

#### `<FormError />`
Display form-level errors in a consistent format.

```jsx
import { FormError } from 'formax-ui';

<FormError
  message="Please fix the following errors:"
  errors={['Email is required', 'Password is too short']}
/>
```

#### `<SubmitButton />`
Enhanced submit button with loading states and variants.

```jsx
import { SubmitButton } from 'formax-ui';
import { Send } from 'lucide-react';

<SubmitButton
  loading={isSubmitting}
  loadingText="Submitting..."
  variant="primary"
  size="lg"
  icon={<Send className="h-4 w-4" />}
  fullWidth
>
  Submit Form
</SubmitButton>
```

#### `<FormProvider />`
Context provider for form integration.

```jsx
import { FormProvider } from 'formax-ui';
import { useForm } from 'react-hook-form';

function MyForm() {
  const form = useForm();
  
  return (
    <FormProvider formMethods={form}>
      {/* Your form components */}
    </FormProvider>
  );
}
```

## 🔧 Integration Examples

### React Hook Form + Zod

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormProvider, TextInput, SubmitButton } from 'formax-ui';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <FormProvider formMethods={form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="Email"
          name="email"
          type="email"
          error={errors.email?.message}
          register={register('email')}
          required
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          error={errors.password?.message}
          register={register('password')}
          required
        />
        <SubmitButton>Sign In</SubmitButton>
      </form>
    </FormProvider>
  );
}
```

### Standalone Usage

```jsx
import { useState } from 'react';
import { TextInput, SubmitButton } from 'formax-ui';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <TextInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <SubmitButton>Send Message</SubmitButton>
    </form>
  );
}
```

## 🎨 Customization

### Tailwind CSS Configuration

Add Formax UI's color palette to your Tailwind config:

```js
// tailwind.config.js
module.exports = {
  content: [
    // ... your content paths
    './node_modules/formax-ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        formax: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

### Custom Styling

All components accept a `className` prop for custom styling:

```jsx
<TextInput
  label="Custom Input"
  name="custom"
  className="my-custom-input"
/>
```

## 📱 Responsive Design

All components are built with mobile-first responsive design:

```jsx
// Grid layouts automatically adapt
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <TextInput label="First Name" name="firstName" />
  <TextInput label="Last Name" name="lastName" />
</div>
```

## ♿ Accessibility

Formax UI components are built with accessibility in mind:

- **ARIA attributes**: Proper `aria-*` attributes for screen readers
- **Keyboard navigation**: Full keyboard support for all interactive elements
- **Focus management**: Visible focus indicators and logical tab order
- **Error association**: Form errors are properly associated with inputs
- **Semantic HTML**: Uses proper HTML5 form elements

## 🚀 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/Formax-UI/dev.git.git

# Install dependencies
npm install

# Build the library
npm run build

# Start the playground
npm run playground
```

### Available Scripts

- `npm run build` - Build the library
- `npm run dev` - Watch mode for development
- `npm run playground` - Start the playground app
- `npm run type-check` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 📄 License

MIT © [Formax UI Team](https://github.com/Formax-UI/dev.git)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- 📧 Email: support@formax-ui.com
- 🐛 Issues: [GitHub Issues](https://github.com/Formax-UI/dev.git/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Formax-UI/dev.git/discussions)

---

<div align="center">
  <strong>Made with ❤️ for the React community</strong>
</div> 