import _config from '../gulp.config.js';
const { BUILD_PATH } = _config;

import browserSync from 'browser-sync';
browserSync.create();

export const server = () => {
  browserSync.init({
    open: false,
    cors: true,
    port: 3000,

    server: {
      baseDir: BUILD_PATH,
    },
  });
};

export const refresh = (done) => {
  browserSync.reload();
  done();
};
