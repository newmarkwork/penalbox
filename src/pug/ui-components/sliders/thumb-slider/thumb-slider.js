import Swiper from 'swiper';
import { Navigation, Thumbs } from 'swiper/modules';

const thumbSliders = document.querySelectorAll('.thumb-slider');

if (thumbSliders.length) {
  thumbSliders.forEach((slider) => {
    const thumbSliderMain = slider.querySelector('.thumb-slider-main');
    const thumbSliderThumbs = slider.querySelector('.thumb-slider-thumbs');

    const thumbs = new Swiper(thumbSliderThumbs, {
      slidesPerView: 'auto',
      watchOverflow: true,
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
      autoHeight: true,
      updateOnWindowResize: true,
      direction: 'vertical',
    });

    new Swiper(thumbSliderMain, {
      modules: [Navigation, Thumbs],
      slidesPerView: 1,
      spaceBetween: 10,
      watchOverflow: true,
      watchSlidesProgress: true,
      preventInteractionOnTransition: true,

      navigation: {
        nextEl: thumbSliderMain.querySelector('.thumb-slider-button-next'),
        prevEl: thumbSliderMain.querySelector('.thumb-slider-button-prev'),
      },

      thumbs: {
        swiper: thumbs,
      },
    });
  });
}
