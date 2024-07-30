import { gsap } from 'gsap';
//import { modalOverlay } from '../utils/nodesHelper';

export class Modal {
  constructor(modal, options = {}) {
    this.preventBodyLock = options.preventBodyLock ? true : false;
    this.modal = modal;
    this.overlay = this.modal.parentNode;
    this.close = this.modal.querySelector('.modal-closer');

    this.id = this.modal.getAttribute('id');
    this.openers = document.querySelectorAll(
      '[data-modal-opener="' + this.id + '"]'
    );
    this.isInited = false;

    this.focusableElements = [
      'a[href]',
      'input',
      'select',
      'textarea',
      'button',
      'iframe',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])',
    ];
    this.init();
  }

  bodyLocker = (bool) => {
    const body = document.querySelector('body');

    if (bool) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }
  };

  focusTrap = () => {
    const firstFocusableElement = this.modal.querySelectorAll(
      this.focusableElements
    )[0];
    const focusableContent = this.modal.querySelectorAll(
      this.focusableElements
    );
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    if (focusableContent.length) {
      const onBtnClickHandler = (evt) => {
        const isTabPressed = evt.key === 'Tab' || evt.key === 9;

        if (evt.key === 'Escape') {
          document.removeEventListener('keydown', onBtnClickHandler);
        }

        if (!isTabPressed) {
          return;
        }

        if (evt.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            evt.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            evt.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', onBtnClickHandler);

      firstFocusableElement.focus();
    }
  };

  addListeners = () => {
    if (this.openers) {
      this.openers.forEach((opener) => {
        opener.removeEventListener('click', this.openModal);
      });
    }

    document.addEventListener('click', this.closeByOverlayClick);
    document.addEventListener('keydown', this.closeByEscBtn);

    if (this.close) {
      this.close.addEventListener('click', this.closeByBtnClick);
    }
  };

  refresh = () => {
    document.removeEventListener('click', this.closeByOverlayClick);
    document.removeEventListener('keydown', this.closeByEscBtn);

    if (this.close) {
      this.close.removeEventListener('click', this.closeByBtnClick);
    }

    gsap.fromTo(
      this.overlay,
      { display: 'flex' },
      {
        opacity: 0,
        display: 'none',
        duration: 0.6,
        ease: 'ease-in',
        onComplete: () => {
          //если в модалке есть форма, при закрытии обнуляю поля
          this.modal.querySelectorAll('form').forEach((f) => f.reset());
        },
      }
    );

    !this.preventBodyLock ? this.bodyLocker(false) : null;

    this.preventBodyLock = false;

    if (this.openers) {
      this.openers.forEach((opener) => {
        opener.addEventListener('click', this.openModal);
      });
    }
  };

  closeByOverlayClick = (evt) => {
    if (evt.target === this.overlay) {
      this.refresh();
    }
  };

  closeByEscBtn = (evt) => {
    if (evt.key === 'Escape') {
      this.refresh();
    }
  };

  closeByBtnClick = () => {
    this.refresh();
  };

  openModal = (evt) => {
    evt.preventDefault();

    this.bodyLocker(true);
    gsap.fromTo(
      this.overlay,
      { display: 'none', opacity: 0 },
      {
        display: 'flex',
        opacity: 1,
        duration: 0.6,
        ease: 'ease-in',
        onComplete: () => {
          this.addListeners();
          this.focusTrap();
        },
      }
    );
  };

  show = () => {
    this.bodyLocker(true);
    gsap.fromTo(
      this.overlay,
      { display: 'none', opacity: 0 },
      {
        display: 'flex',
        opacity: 1,
        duration: 0.6,
        ease: 'ease-in',
        onComplete: () => {
          this.addListeners();
          this.focusTrap();
        },
      }
    );
  };

  init() {
    if (this.openers) {
      this.isInited = true;
      this.openers.forEach((opener) => {
        opener.addEventListener('click', this.openModal);
      });
    } else {
      console.error(
        'Не добавлена кнопка открытия модального окна, либо в ней не прописан аттр-т: data-modal-anchor={modal-id} '
      );
    }
  }
}
