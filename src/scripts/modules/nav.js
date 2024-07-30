import { nav, navOpener, navCloser } from '../helpers/nodes';
import { bodyLocker } from '../helpers/utils/bodyLocker';
import { focusTrap } from '../helpers/utils/focusTrap';

if (nav && navOpener && navCloser) {
  const closeNav = () => {
    nav.classList.remove('mobile-active');

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

    nav.classList.add('mobile-active');
    focusTrap(nav);

    navOpener.removeEventListener('click', onClickOpenNav);
    navCloser.addEventListener('click', closeNav);
    nav.addEventListener('click', onOverlayClickCloseNav);
    document.addEventListener('keydown', onEscPressCloseNav);
  };

  navOpener.addEventListener('click', onClickOpenNav);
}
