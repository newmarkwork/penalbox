import _config from '../gulp.config.js';
const { config } = _config;

import gulp from 'gulp';
const { src, dest } = gulp;

import ttf2woff2 from 'gulp-ttf2woff2';

export const fonts = (done) => {
  src(config.fonts.src, { encoding: false })
    .pipe(ttf2woff2())
    .pipe(dest(config.fonts.dest));

  done();
};
