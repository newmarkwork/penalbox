import _config from '../gulp.config.js'
const { BUILD_PATH } = _config

import { deleteAsync } from 'del'

export const clean = () => {
  return deleteAsync([BUILD_PATH])
}
