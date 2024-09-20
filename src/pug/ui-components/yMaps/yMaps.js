const map = document.querySelector('#y-maps');

if (map) {
  console.log(map.dataset.coords);
  let myMap = null;

  window.addEventListener('load', () => {
    ymaps.ready(init);
  });

  function init() {
    // Создание карты.
    myMap = new ymaps.Map('y-maps', {
      center: JSON.parse('[' + map.dataset.coords + ']'),
      zoom: map.dataset.zoom,
      controls: [],
      behaviors: ['drag'],
    });

    const MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
      '<div class="ymaps-icon-content-layout">$[properties.iconContent]</div>'
    );

    // Метка
    const officePlacemark = new ymaps.Placemark(
      JSON.parse('[' + map.dataset.coords + ']'),
      {
        iconContent: map.dataset.iconContent
          ? `<div class="ymaps-icon-content-layout-inner">${map.dataset.iconContent}</div>`
          : '',
      },
      {
        // Опции.
        // Необходимо указать данный тип макета.
        iconLayout: 'default#imageWithContent',
        // Своё изображение иконки метки.
        iconImageHref: map.dataset.iconPath,
        // Размеры метки.
        iconImageSize: [60, 60],
        // Смещение левого верхнего угла иконки относительно
        // её "ножки" (точки привязки).
        iconImageOffset: [-30, -30],
        iconContentOffset: [60, 15],

        iconContentLayout: MyIconContentLayout,
      }
    );

    myMap.geoObjects.add(officePlacemark);

    // ZOOM-CONTROL
    let ZoomLayout = ymaps.templateLayoutFactory.createClass(
      //Шаблон html кнопок зума
      "<div class='zoom-btns'>" +
        "<button id='zoom-in' class='zoom-btn zoom-btn-in' aria-label='Увеличить масштаб'></button>" +
        "<button id='zoom-out' class='zoom-btn zoom-btn-out' aria-label='Уменьшить масштаб'></button>" +
        '</div>',
      {
        // Переопределяем методы макета, чтобы выполнять дополнительные действия
        // при построении и очистке макета.
        build: function () {
          // Вызываем родительский метод build.
          ZoomLayout.superclass.build.call(this);

          // Привязываем функции-обработчики к контексту и сохраняем ссылки
          // на них, чтобы потом отписаться от событий.
          this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
          this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);

          // Начинаем слушать клики на кнопках макета.
          let zoomInBtn = document.getElementById('zoom-in');
          let zoomOutBtn = document.getElementById('zoom-out');

          zoomInBtn.addEventListener('click', this.zoomInCallback);
          zoomOutBtn.addEventListener('click', this.zoomOutCallback);
        },

        clear: function () {
          // Снимаем обработчики кликов.
          zoomInBtn.removeEventListener('click', this.zoomInCallback);
          zoomOutBtn.removeEventListener('click', this.zoomOutCallback);
          // Вызываем родительский метод clear.
          ZoomLayout.superclass.clear.call(this);
        },

        zoomIn: function () {
          myMap.balloon.close();

          let map = this.getData().control.getMap();
          map.setZoom(map.getZoom() + 1, { checkZoomRange: true });
        },

        zoomOut: function () {
          myMap.balloon.close();

          let map = this.getData().control.getMap();
          map.setZoom(map.getZoom() - 1, { checkZoomRange: true });
        },
      }
    );

    let zoomControl = new ymaps.control.ZoomControl({
      options: {
        layout: ZoomLayout,
        position: { right: '30px', bottom: '50px' },
      },
    });
    myMap.controls.add(zoomControl);
  }
}
