import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const heroSlider = document.querySelector('.hero-slider');
console.log(heroSlider);

if (heroSlider) {
  const pagination = heroSlider.querySelector('.hero-slider-pagination');

  new Swiper(heroSlider, {
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 10,

    pagination: {
      el: pagination ? pagination : null,
      dynamicBullets: false,
      clickable: false,
      type: 'fraction',
    },

    navigation: {
      nextEl: heroSlider.querySelector('.hero-slider-button-next'),
      prevEl: heroSlider.querySelector('.hero-slider-button-prev'),
    },
  });
}
