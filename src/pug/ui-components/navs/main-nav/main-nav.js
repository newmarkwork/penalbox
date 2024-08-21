import gsap from 'gsap';

import { nav, navOpener, navCloser } from '../../../../scripts/helpers/nodes';
import { bodyLocker } from '../../../../scripts/helpers/utils/bodyLocker';
import { focusTrap } from '../../../../scripts/helpers/utils/focusTrap';

if (nav && navOpener && navCloser) {
  const animationDuration = 0.4;

  const closeNav = (duration) => {
    gsap.fromTo(
      '.main-nav',
      {
        backgroundColor: 'rgba(245, 245, 245, 0.5)',
        backdropFilter: 'blur(3px)',
      },
      {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        duration: duration,
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
        duration: duration,
      }
    );

    navCloser.removeEventListener('click', closeNav);
    nav.removeEventListener('click', onOverlayClickCloseNav);
    document.removeEventListener('keydown', onEscPressCloseNav);
    navOpener.addEventListener('click', onClickOpenNav);
    bodyLocker(false);
  };

  window.addEventListener('resize', () => {
    closeNav(0);
  });

  const onOverlayClickCloseNav = (evt) => {
    if (evt.target === nav) {
      closeNav(animationDuration);
    }
  };

  const onEscPressCloseNav = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      closeNav(animationDuration);
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
        duration: animationDuration,
      }
    );

    gsap.fromTo(
      '.main-nav__wrapper',
      {
        transform: 'translateX(-100vw)',
      },
      {
        transform: 'translateX(0)',
        duration: animationDuration,
      }
    );

    focusTrap(nav);

    navOpener.removeEventListener('click', onClickOpenNav);
    navCloser.addEventListener('click', () => {
      closeNav(animationDuration);
    });
    nav.addEventListener('click', onOverlayClickCloseNav);
    document.addEventListener('keydown', onEscPressCloseNav);
  };

  navOpener.addEventListener('click', onClickOpenNav);

  const mobileNavListExpanders = nav.querySelectorAll(
    '.main-nav__list-item-expand-btn'
  );

  if (mobileNavListExpanders.length) {
    mobileNavListExpanders.forEach((item) => {
      item.addEventListener('click', () => {
        item.parentNode.classList.toggle('expanded');

        if (item.parentNode.classList.contains('expanded')) {
          item.style.transform = 'rotate(0)';
        } else {
          item.style.transform = 'rotate(-90deg)';
        }
      });
    });
  }
}
