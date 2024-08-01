import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const sliders = document.querySelectorAll('.product-card-inner-slider');

if (sliders.length) {
  sliders.forEach((slider) => {
    const pagination = slider.querySelector(
      '.product-card-inner-slider-pagination'
    );

    const swiper = new Swiper(slider, {
      modules: [Navigation, Pagination],
      slidesPerView: 'auto',
      nested: true,

      pagination: {
        el: pagination ? pagination : null,
        dynamicBullets: false,
        clickable: true,
      },
    });

    if (pagination) {
      const paginationItems = slider.querySelectorAll(
        '.swiper-pagination-bullet'
      );

      let mouseCurrentTarget = null;

      paginationItems.forEach((item, index) => {
        item.addEventListener('mouseover', (evt) => {
          setTimeout(() => {
            onMouseOverChangeSlide(evt.target, index);
          }, 200);
        });
      });

      const onMouseOverChangeSlide = (current, index) => {
        if (current !== null && current === mouseCurrentTarget) {
          swiper.slideTo(index);
        }
      };

      document.addEventListener('mouseover', (evt) => {
        mouseCurrentTarget = evt.target;
      });
    }
  });
}
