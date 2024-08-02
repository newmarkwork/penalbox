import IMask from 'imask';

const phoneFields = document.querySelectorAll('[type="tel"]');

const maskOptions = {
  mask: '+{7}(000) 000 - 00 - 00',
};

phoneFields.forEach((field) => {
  IMask(field, maskOptions);
});
