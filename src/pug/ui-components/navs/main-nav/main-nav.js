import gsap from 'gsap';

import { nav, navOpener, navCloser } from '../../../../scripts/helpers/nodes';
import { bodyLocker } from '../../../../scripts/helpers/utils/bodyLocker';
import { focusTrap } from '../../../../scripts/helpers/utils/focusTrap';

if (nav && navOpener && navCloser) {
  const closeNav = () => {
    gsap.fromTo(
      '.main-nav',
      {
        backgroundColor: 'rgba(245, 245, 245, 0.5)',
        backdropFilter: 'blur(3px)',
      },
      {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        duration: 0.4,
        onComplete: () => {
          nav.classList.remove('mobile-expanded');
        },
      }
    );

    gsap.fromTo(
      '.main-nav__wrapper',
      {
        transform: 'translateX(0)',
      },
      {
        transform: 'translateX(-100vw)',
        duration: 0.4,
      }
    );

    navCloser.removeEventListener('click', closeNav);
    nav.removeEventListener('click', onOverlayClickCloseNav);
    document.removeEventListener('keydown', onEscPressCloseNav);
    navOpener.addEventListener('click', onClickOpenNav);
    bodyLocker(false);
  };

  const onOverlayClickCloseNav = (evt) => {
    if (evt.target === nav) {
      closeNav();
    }
  };

  const onEscPressCloseNav = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      closeNav();
    }
  };

  const onClickOpenNav = () => {
    bodyLocker(true);

    nav.classList.add('mobile-expanded');

    gsap.fromTo(
      '.main-nav',
      {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
      },
      {
        backgroundColor: 'rgba(245, 245, 245, 0.5)',
        backdropFilter: 'blur(3px)',
        duration: 0.4,
      }
    );

    gsap.fromTo(
      '.main-nav__wrapper',
      {
        transform: 'translateX(-100vw)',
      },
      {
        transform: 'translateX(0)',
        duration: 0.4,
      }
    );

    focusTrap(nav);

    navOpener.removeEventListener('click', onClickOpenNav);
    navCloser.addEventListener('click', closeNav);
    nav.addEventListener('click', onOverlayClickCloseNav);
    document.addEventListener('keydown', onEscPressCloseNav);
  };

  navOpener.addEventListener('click', onClickOpenNav);
}
