function loadItems() {
  const data = localStorage.getItem('items');
  return data ? JSON.parse(data) : [];
}

function saveItems(items) {
  localStorage.setItem('items', JSON.stringify(items));
}

function renderZone(list, elementId, renderFn) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = '';
  list.forEach(item => container.appendChild(renderFn(item)));
}

function showGreenItem(item) {
  const li = document.createElement('li');
  li.textContent = `${item.track} - ${item.name} (${item.receivedQty})`;
  return li;
}

function showYellowItem(item) {
  const li = document.createElement('li');
  li.textContent = `${item.track} - ${item.name} (ожидалось ${item.expectedQty}, принято ${item.receivedQty})`;
  return li;
}

function showGreyItem(item) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = `${item.track} - ${item.name} (ожидается ${item.expectedQty})`;
  const input = document.createElement('input');
  input.type = 'number';
  input.value = item.expectedQty;
  const btn = document.createElement('button');
  btn.textContent = 'Обновить';
  btn.onclick = () => {
    const items = loadItems();
    const target = items.find(i => i.track === item.track);
    target.expectedQty = Number(input.value);
    saveItems(items);
    renderLists();
  };
  li.appendChild(span);
  li.appendChild(input);
  li.appendChild(btn);
  return li;
}

function renderLists() {
  const items = loadItems();
  renderZone(items.filter(i => i.status === 'green'), 'green-list', showGreenItem);
  renderZone(items.filter(i => i.status === 'yellow'), 'yellow-list', showYellowItem);
  renderZone(items.filter(i => !i.status || i.status === 'grey'), 'grey-list', showGreyItem);
}

function searchItem() {
  const track = document.getElementById('track-input').value.trim();
  const items = loadItems();
  const item = items.find(i => i.track === track);
  if (!item) {
    alert('Товар не найден');
    return;
  }
  document.getElementById('product-info').style.display = 'block';
  document.getElementById('product-name').textContent = item.name;
  document.getElementById('expected').textContent = item.expectedQty;
  document.getElementById('submit-btn').onclick = () => submitQty(item);
}

function submitQty(item) {
  const qty = Number(document.getElementById('received-input').value);
  const items = loadItems();
  const target = items.find(i => i.track === item.track);
  target.receivedQty = qty;
  if (qty === target.expectedQty) {
    target.status = 'green';
    document.getElementById('barcode').textContent = `Штрихкод: ${target.track}`;
  } else {
    target.status = 'yellow';
  }
  saveItems(items);
  renderLists();
  document.getElementById('product-info').style.display = 'none';
  document.getElementById('track-input').value = '';
  document.getElementById('received-input').value = '';
}

document.getElementById('search-btn').addEventListener('click', searchItem);

document.getElementById('import-btn').onclick = () => {
  try {
    const data = JSON.parse(document.getElementById('import-data').value);
    const items = loadItems();
    data.forEach(d => items.push({ ...d, status: 'grey' }));
    saveItems(items);
    renderLists();
  } catch (e) {
    alert('Неверный формат');
  }
};

document.getElementById('export-btn').onclick = () => {
  const items = loadItems().filter(i => i.status === 'green');
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items));
  const dl = document.createElement('a');
  dl.setAttribute('href', dataStr);
  dl.setAttribute('download', 'accepted.json');
  dl.click();
};

renderLists();
