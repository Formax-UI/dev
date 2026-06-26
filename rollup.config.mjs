import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const external = [
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.dependencies || {}),
  '@hookform/resolvers/zod',
  'node:fs',
  'node:path',
  'react/jsx-runtime',
];

const tsPlugins = [peerDepsExternal(), resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })];

const libraryConfig = ({ input, cjs, esm, css }) => ({
  input,
  output: [
    {
      file: cjs,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: esm,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    ...(css
      ? [
          postcss({
            config: {
              path: './postcss.config.js',
            },
            extensions: ['.css'],
            extract: css,
            minimize: true,
          }),
        ]
      : []),
  ],
  external,
});

const dtsConfig = (input, output) => ({
  input,
  output: [{ file: output, format: 'esm' }],
  plugins: [dts()],
  external: [/\.css$/],
});

export default [
  libraryConfig({
    input: 'src/index.ts',
    cjs: packageJson.main,
    esm: packageJson.module,
    css: 'styles.css',
  }),
  libraryConfig({
    input: 'src/workflow-entry.ts',
    cjs: 'dist/workflow.js',
    esm: 'dist/workflow.mjs',
  }),
  libraryConfig({
    input: 'src/legacy.ts',
    cjs: 'dist/legacy.js',
    esm: 'dist/legacy.mjs',
    css: 'legacy.css',
  }),
  libraryConfig({
    input: 'src/templates.tsx',
    cjs: 'dist/templates.js',
    esm: 'dist/templates.mjs',
  }),
  libraryConfig({
    input: 'src/intelligence.ts',
    cjs: 'dist/intelligence.js',
    esm: 'dist/intelligence.mjs',
  }),
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.js',
      format: 'cjs',
    },
    plugins: tsPlugins,
    external,
  },
  {
    input: 'src/ai.ts',
    output: [
      {
        file: 'dist/ai.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/ai.mjs',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      ...tsPlugins,
    ],
    external,
  },
  dtsConfig('dist/index.d.ts', 'dist/index.d.ts'),
  dtsConfig('dist/workflow-entry.d.ts', 'dist/workflow.d.ts'),
  dtsConfig('dist/legacy.d.ts', 'dist/legacy.d.ts'),
  dtsConfig('dist/templates.d.ts', 'dist/templates.d.ts'),
  dtsConfig('dist/intelligence.d.ts', 'dist/intelligence.d.ts'),
  dtsConfig('dist/ai.d.ts', 'dist/ai.d.ts'),
];
