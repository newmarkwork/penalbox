import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const productCardSliders = document.querySelectorAll('.product-card-slider');

if (productCardSliders.length) {
  productCardSliders.forEach((slider) => {
    const pagination = slider.querySelector('.product-card-slider-pagination');

    new Swiper(slider, {
      modules: [Navigation, Pagination],
      slidesPerView: 'auto',
      spaceBetween: 10,

      pagination: {
        el: pagination ? pagination : null,
        dynamicBullets: false,
        clickable: true,
      },

      navigation: {
        nextEl: slider.querySelector('.product-card-slider-button-next'),
        prevEl: slider.querySelector('.product-card-slider-button-prev'),
      },

      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
        },

        960: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
      },
    });
  });
}
