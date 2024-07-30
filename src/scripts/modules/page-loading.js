import imagesLoaded from 'imagesloaded';
import { gsap } from 'gsap';
import { bodyLocker } from '../helpers/utils/bodyLocker.js';
import { loader } from '../helpers/nodes.js';

if (loader) {
  bodyLocker(true);

  imagesLoaded('body', { background: true }, () => {
    gsap.fromTo(
      '.loader',
      { opacity: 1 },
      {
        opacity: 0,
        display: 'none',
        duration: 1,
        delay: 0.5,
        ease: 'ease-in',
        onComplete: () => {
          bodyLocker(false);
        },
      }
    );
  });
}
