import _config from '../gulp.config.js';
const { config } = _config;

import { src, dest } from 'gulp';

import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import cheerio from 'gulp-cheerio';
import replace from 'gulp-replace';
import diffableHtml from 'gulp-diffable-html';
import gulpif from 'gulp-if';

export const sprite = (done) => {
  src(config.sprite.src)
    .pipe(svgmin())
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: false },
      })
    )
    // sometimes cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(gulpif(config.isDev, diffableHtml()))
    .pipe(dest(config.sprite.dest));

  done();
};
