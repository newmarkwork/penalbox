import _config from '../gulp.config.js'
const { config } = _config

import gulp from 'gulp'
const { src, dest } = gulp

import gulpPug from 'gulp-pug'
import plumber from 'gulp-plumber'
import gulpIf from 'gulp-if'
import htmlhint from 'gulp-htmlhint'
import diffableHtml from 'gulp-diffable-html'

export const pug = (done) => {
  src([config.pug.src])
    .pipe(plumber())
    .pipe(gulpPug())
    .pipe(gulpIf(config.isProd, diffableHtml()))
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter())
    .pipe(dest(config.pug.dest))

  done()
}
