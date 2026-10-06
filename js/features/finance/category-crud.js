// Category CRUD
function showAddCategory() {
  document.getElementById('new-category-name').value = '';
  newCatIcon = '📁'; renderCatGrid();
  document.getElementById('modal-category').classList.remove('hidden');
  document.getElementById('modal-category').classList.add('flex');
}
function addCategory() {
  const name = document.getElementById('new-category-name').value.trim();
  if (!name) return alert('Nama wajib diisi');
  const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36).slice(-4);
  state.categories.push({ id, name, icon: newCatIcon });
  saveState();
  renderAll();
  hideModal('modal-category');
}
function deleteCategory(id) {
  if (state.categories.length <= 1) return alert('Minimal harus ada 1 kategori');
  if (!confirm('Hapus kategori ini?')) return;
  state.categories = state.categories.filter(c => c.id !== id);
  saveState();
  renderAll();
}

