// ==================== LOGO KATEGORI ====================
const CAT_EMOJIS = ['🍪','🍜','🍔','☕','🛒','🚗','🚌','⛽','📄','💡','📱','🏠','🎬','🎮','💊','🏥','💰','🎁','📚','🎓','👕','✈️','🐾','💇','🏋️','🔧','💳','🏦','📈','🧾','🍼','🙏','📌','📁','⭐','❤️'];
let newCatIcon = '📁';
const isImgIcon = v => typeof v === 'string' && v.startsWith('data:');
function catIcon(c) {
  const v = (c && c.icon) || '📁';
  return isImgIcon(v) ? `<img src="${v}" alt="" class="inline-block align-middle object-cover rounded" style="width:1.4em;height:1.4em" />` : v;
}
function renderCatGrid() {
  document.getElementById('new-category-icon-preview').innerHTML = catIcon({ icon: newCatIcon });
  document.getElementById('cat-icon-grid').innerHTML = CAT_EMOJIS.map(e =>
    `<button type="button" onclick="newCatIcon='${e}';renderCatGrid()" class="h-10 rounded-xl text-xl ${e === newCatIcon ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-50 hover:bg-slate-100'}">${e}</button>`).join('');
}
function handleCatUpload(e) {
  const file = e.target.files && e.target.files[0]; e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return alert('File harus berupa gambar');
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 96;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 96, 96);
      newCatIcon = c.toDataURL('image/png'); renderCatGrid();
    };
    img.onerror = () => alert('Gambar tidak bisa dibaca');
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

