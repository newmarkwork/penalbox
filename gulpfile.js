import _config from './gulp/gulp.config.js';
const { config } = _config;

import gulp from 'gulp';
const { series, parallel, watch } = gulp;

config.setEnv();

import { clean } from './gulp/tasks/clean.js';
import { copyStatic } from './gulp/tasks/copyStatic.js';
import { pug } from './gulp/tasks/pug.js';
import { styles as sass } from './gulp/tasks/sass.js';
import { server, refresh } from './gulp/tasks/server.js';
import { scripts } from './gulp/tasks/scripts.js';
import { images } from './gulp/tasks/images.js';
import { sprite } from './gulp/tasks/sprite.js';
import { fonts } from './gulp/tasks/fonts.js';
import { cleanUnusedCss } from './gulp/tasks/cleanUnusedCss.js';

export const start = series(
  clean,
  copyStatic,
  parallel(fonts, pug, sass, scripts, images, sprite),
  server
);

export const build = start;
export const cleanCss = cleanUnusedCss;

watch(config.staticResources.watch, series(copyStatic, refresh));
watch(config.fonts.watch, series(fonts, refresh));
watch(config.pug.watch, series(parallel(pug, sass, scripts), refresh));
watch(config.styles.watch, series(sass, refresh));
watch(config.scripts.watch, series(scripts, refresh));
watch(config.images.watch, series(images, refresh));
watch(config.sprite.watch, series(sprite, refresh));
