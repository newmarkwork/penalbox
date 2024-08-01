const items = document.querySelectorAll('.tabs__header-item');

if (items.length) {
  const onClickExpandContent = (evt) => {
    const target = evt.target;

    if (target.classList.contains('active')) return;

    const ID = target.dataset.id;

    document
      .querySelector('.tabs__header-item.active')
      .classList.remove('active');
    document
      .querySelector('.tabs__content-item.active')
      .classList.remove('active');

    target.classList.add('active');
    document
      .querySelector(`.tabs__content-item[data-id="${ID}"]`)
      .classList.add('active');
  };

  items.forEach((item) => {
    item.addEventListener('click', onClickExpandContent);
  });
}
