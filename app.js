// ====== SETTINGS (edit these) ======
const CONFIG = {
  API: 'api.php',
  PHONE: '0240930115',
  WHATSAPP: '233240930115',          // international format, no +
  MAP: { lat: 5.6037, lng: -0.1870, zoom: 12, label: 'Mr. Sarfo Animal Farm',
         tileKey: '' }               // PUT MAP API KEY HERE (MapTiler). Leave empty to use free OpenStreetMap tiles.
};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let animals = [], filter = 'All';

function render() {
  const cats = ['All', ...new Set(animals.map(a => a.category))];
  $('#filters').innerHTML = cats.map(c => `<button class="${c === filter ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  const list = animals.filter(a => filter === 'All' || a.category === filter);
  $('#grid').innerHTML = list.length ? list.map(a => `
    <article class="card">
      <img src="${a.image ? 'uploads/' + esc(a.image) : 'https://placehold.co/400?text=' + esc(a.category)}" alt="${esc(a.name)}" loading="lazy">
      <h3>${esc(a.name)}</h3><small>${esc(a.category)}${a.breed ? ' · ' + esc(a.breed) : ''}</small>
      <p>${esc(a.description)}</p>
      <div class="row"><span class="price">${a.price ? 'GH₵ ' + Number(a.price).toLocaleString() : 'Ask for price'}</span>
        <span class="tag ${a.available ? '' : 'sold'}">${a.available ? 'Available' : 'Sold'}</span></div>
    </article>`).join('') : '<p style="text-align:center;grid-column:1/-1">No animals listed yet. Check back soon.</p>';
}

async function load() {
  try { animals = await (await fetch(`${CONFIG.API}?action=animals`)).json(); render(); }
  catch { $('#grid').innerHTML = '<p>Could not load animals. Please refresh.</p>'; }
}

$('#filters').addEventListener('click', e => { if (e.target.dataset.c) { filter = e.target.dataset.c; render(); } });

$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  const m = $('#msg'); m.textContent = 'Sending…';
  const r = await fetch(`${CONFIG.API}?action=inquiry`, { method: 'POST', body: new FormData(e.target) });
  const d = await r.json();
  m.textContent = r.ok ? 'Thanks! We will contact you shortly.' : d.error;
  if (r.ok) e.target.reset();
});

$('#call').href = 'tel:' + CONFIG.PHONE;
$('#wa').href = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hello, I am interested in your animals.')}`;
$('#yr').textContent = new Date().getFullYear();

const { lat, lng, zoom, label, tileKey } = CONFIG.MAP;
const map = L.map('map').setView([lat, lng], zoom);
L.tileLayer(tileKey ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${tileKey}` : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
L.marker([lat, lng]).addTo(map).bindPopup(`<b>${label}</b><br><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}">Get directions</a>`).openPopup();

load();
