import { sendForm } from './send-form';

export const formValidation = (form) => {
  const fields = form.querySelectorAll('[data-required]');

  const setInvalidStatus = (field) => {
    !field.classList.contains('invalid-control')
      ? field.classList.add('invalid-control')
      : null;

    field.classList.add('shaker');

    setTimeout(() => {
      field.classList.remove('shaker');
    }, 800);
  };

  const setValidStatus = (field) => {
    field.classList.contains('invalid-control')
      ? field.classList.remove('invalid-control')
      : null;
  };

  fields.forEach((field) => {
    field.addEventListener('change', () => {
      setValidStatus(field);
    });
    if (field['type'] === 'text') {
      if (field.value.trim().length < 2) {
        setInvalidStatus(field);
      } else {
        setValidStatus(field);
      }
    } else if (field['type'] === 'tel') {
      if (field.value.trim().length < 21) {
        setInvalidStatus(field);
      } else {
        setValidStatus(field);
      }
    }
  });

  const isInvalid = document.querySelector('.invalid-control');

  if (!isInvalid) {
    sendForm(form);
  }
};
