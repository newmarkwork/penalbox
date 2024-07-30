import _config from '../gulp.config.js';
const { config, BUILD_PATH } = _config;

import gulp from 'gulp';
const { src, dest } = gulp;

import purgecss from 'gulp-purgecss';

// import fs from "fs";
// fs.existsSync(path);

export const cleanUnusedCss = (done) => {
  // setTimeout(() => {
    src(`./build/assets/*.css`)
      .pipe(purgecss({
          content: ['./build/*.html'],
      }))
      .pipe(dest('./build/assets/'));
    done(console.log('css cleaned'));
  // }, 200);
}
