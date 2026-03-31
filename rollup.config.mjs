import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.iife.js',
    format: 'iife',
    name: 'snaptext',
    inlineDynamicImports: true,
  },
  external: [], // ensure no external deps
  plugins: [
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonjs({ include: 'node_modules/**' }),
    typescript({ tsconfig: './tsconfig.json' }),
  ]
};
