import _config from '../gulp.config.js'
const { config } = _config

import gulp from 'gulp'
const { src, dest } = gulp

import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)

import plumber from 'gulp-plumber'
import autoprefixer from 'gulp-autoprefixer'
import cleanCss from 'gulp-clean-css'
import gulpIf from 'gulp-if'
import rename from 'gulp-rename'
import { cleanUnusedCss } from './cleanUnusedCss.js'
// console.log(cleanUnusedCss);

export const styles = (done) => {
  src(config.styles.src, { sourcemaps: config.isProd ? false : true })
    .pipe(plumber())
    .pipe(sass())

    .pipe(
      gulpIf(
        config.isProd,
        autoprefixer({
          cascade: false,
          grid: true,
          overrideBrowserslist: ['last 3 versions'],
        })
      )
    )
    .pipe(
      gulpIf(
        config.isProd,
        cleanCss({
          level: 2,
        })
      )
    )
    .pipe(gulpIf(config.isProd, rename({ suffix: '.min' })))
    .pipe(dest(config.styles.dest, { sourcemaps: '.' }))

  done()
}
