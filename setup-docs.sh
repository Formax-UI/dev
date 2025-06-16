#!/bin/bash

echo "🚀 Setting up Formax UI Documentation..."

# Navigate to docs directory
cd docs

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create missing configuration files
echo "⚙️ Creating configuration files..."

# PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./app/components/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# ESLint config
cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals"]
}
EOF

echo "🎨 Documentation site setup complete!"
echo ""
echo "To start the development server:"
echo "  cd docs"
echo "  npm run dev"
echo ""
echo "The documentation will be available at http://localhost:3000" 