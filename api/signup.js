const { json, requireMethod, dbConfig, supabase, normalizeEmail, hashPassword, makeSalt, makeToken, publicUser } = require('../lib/auth');

module.exports = async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  if (!dbConfig()) return json(res, 503, { message: 'Server auth belum dikonfigurasi di Vercel.' });
  try {
    const { name = '', email = '', password = '' } = req.body || {};
    const cleanName = String(name).trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) return json(res, 400, { message: 'Nama wajib diisi.' });
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return json(res, 400, { message: 'Email tidak valid.' });
    if (String(password).length < 6) return json(res, 400, { message: 'Kata sandi minimal 6 karakter.' });

    const existing = await supabase(`mm_users?select=id&email=eq.${encodeURIComponent(cleanEmail)}&limit=1`);
    if (Array.isArray(existing) && existing.length) return json(res, 409, { message: 'Email sudah terdaftar. Silakan Masuk.' });

    const salt = makeSalt();
    const passwordHash = hashPassword(String(password), salt);
    const rows = await supabase('mm_users', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify([{ name: cleanName, email: cleanEmail, password_hash: passwordHash, password_salt: salt }])
    });
    const user = Array.isArray(rows) ? rows[0] : rows;
    return json(res, 201, { ...publicUser(user), token: makeToken(user) });
  } catch (e) {
    console.error('signup', e);
    return json(res, 500, { message: e.message || 'Pendaftaran gagal.' });
  }
};
