const { json, requireMethod, dbConfig, supabase, readToken } = require('../lib/auth');

module.exports = async (req, res) => {
  if (!['GET', 'PUT'].includes(req.method)) { res.setHeader('Allow', 'GET, PUT'); return json(res, 405, { message: `Method ${req.method} tidak diizinkan.` }); }
  if (!dbConfig()) return json(res, 503, { message: 'Server auth belum dikonfigurasi di Vercel.' });
  const token = readToken(req);
  if (!token) return json(res, 401, { message: 'Sesi tidak valid atau sudah kedaluwarsa.' });
  try {
    if (req.method === 'GET') {
      const rows = await supabase(`mm_user_data?select=data&user_id=eq.${encodeURIComponent(token.sub)}&limit=1`);
      return json(res, 200, Array.isArray(rows) && rows[0]?.data ? rows[0].data : {});
    }
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    await supabase('mm_user_data', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{ user_id: token.sub, data, updated_at: new Date().toISOString() }])
    });
    return json(res, 200, { ok: true });
  } catch (e) {
    console.error('data', e);
    return json(res, 500, { message: e.message || 'Sinkronisasi gagal.' });
  }
};
