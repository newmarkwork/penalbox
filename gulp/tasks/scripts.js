import _config from '../gulp.config.js';
const { config } = _config;

import { rollup } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import outputSize from 'rollup-plugin-output-size';
import strip from '@rollup/plugin-strip';

export const scripts = async (done) => {
  return await rollup({
    input: config.scripts.entry,
    plugins: [
      babel({
        presets: ['@babel/env'],
        babelHelpers: 'bundled',
      }),
      nodeResolve(),
      commonjs(),
      config.isProd ? strip() : null,
      config.isProd ? terser() : null,
      outputSize(),
    ],
  }).then((bundle) => {
    return bundle.write({
      file: config.isProd
        ? './build/assets/bundle.min.js'
        : './build/assets/bundle.js',
      format: 'umd',
      name: 'build',
      sourcemap: true,
    });
  });
};
