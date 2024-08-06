import Swiper from 'swiper';
import { Navigation, EffectFade, Thumbs } from 'swiper/modules';

const thumbSliders = document.querySelectorAll('.thumb-slider');

if (thumbSliders.length) {
  thumbSliders.forEach((slider) => {
    const thumbSliderMain = slider.querySelector('.thumb-slider-main');
    const thumbSliderThumbs = slider.querySelector('.thumb-slider-thumbs');

    const thumbs = new Swiper(thumbSliderThumbs, {
      slidesPerView: 3,
      watchOverflow: true,
      spaceBetween: 10,
      watchSlidesProgress: true,
      // direction: 'vertical',
    });

    new Swiper(thumbSliderMain, {
      modules: [Navigation, Thumbs, EffectFade],
      slidesPerView: 1,
      watchOverflow: true,
      watchSlidesProgress: true,

      effect: 'fade',
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
