const { json, requireMethod, dbConfig, supabase, normalizeEmail, hashPassword, safeEqual, makeToken, publicUser } = require('../lib/auth');

module.exports = async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  if (!dbConfig()) return json(res, 503, { message: 'Server auth belum dikonfigurasi di Vercel.' });
  try {
    const { email = '', password = '' } = req.body || {};
    const cleanEmail = normalizeEmail(email);
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return json(res, 400, { message: 'Email tidak valid.' });
    if (String(password).length < 6) return json(res, 400, { message: 'Kata sandi minimal 6 karakter.' });
    const rows = await supabase(`mm_users?select=id,name,email,password_hash,password_salt&email=eq.${encodeURIComponent(cleanEmail)}&limit=1`);
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) return json(res, 401, { message: 'Email atau kata sandi salah.' });
    const candidate = hashPassword(String(password), user.password_salt);
    if (!safeEqual(candidate, user.password_hash)) return json(res, 401, { message: 'Email atau kata sandi salah.' });
    return json(res, 200, { ...publicUser(user), token: makeToken(user) });
  } catch (e) {
    console.error('signin', e);
    return json(res, 500, { message: e.message || 'Login gagal.' });
  }
};
