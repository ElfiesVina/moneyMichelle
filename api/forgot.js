const { json, requireMethod } = require('../lib/auth');
module.exports = async (req, res) => {
  if (!requireMethod(req, res, 'POST')) return;
  // Tidak mengaku mengirim email sebelum provider email benar-benar dipasang.
  return json(res, 501, { message: 'Reset kata sandi belum diaktifkan. Hubungkan provider email terlebih dahulu.' });
};
