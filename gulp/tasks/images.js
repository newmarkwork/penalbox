import _config from '../gulp.config.js'
const { config } = _config

import gulp from 'gulp'
const { src, dest } = gulp

import newer from 'gulp-newer'
import sharpOptimizeImages from 'gulp-sharp-optimize-images'

export const images = (done) => {
  src([config.images.src])
    .pipe(newer(config.images.dest))
    .pipe(
      sharpOptimizeImages({
        logLevel: 'small',
        webp: {
          quality: 80,
          lossless: false,
          alsoProcessOriginal: true,
          progressive: true,
        },
        jpg_to_jpg: {
          quality: 80,
          mozjpeg: true,
        },
      })
    )
    .pipe(dest(config.images.dest))

  done()
}
