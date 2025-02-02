let tables = document.getElementsByTagName('table');

if (tables.length) {
  let length = tables.length,
    i,
    wrapper;

  for (i = 0; i < length; i++) {
    wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'table-wrapper');
    tables[i].parentNode.insertBefore(wrapper, tables[i]);
    wrapper.appendChild(tables[i]);
  }
}
