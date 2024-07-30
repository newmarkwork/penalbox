const focusableElements = [
  'a[href]',
  'input',
  'select',
  'textarea',
  'button',
  'iframe',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])'
];

export const focusTrap = (node) => {
  const focusableContent      = node.querySelectorAll(focusableElements);
  const firstFocusableElement = focusableContent[0];
  const lastFocusableElement  = focusableContent[focusableContent.length - 1];
  firstFocusableElement.focus();

  if(focusableContent.length) {
    const onBtnClickHandler = (evt) => {
        const isTabPressed = evt.key === 'Tab' || evt.key === 9;

        if(evt.key === 'Escape') {
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
    }

    document.addEventListener('keydown', onBtnClickHandler);
  }
}
