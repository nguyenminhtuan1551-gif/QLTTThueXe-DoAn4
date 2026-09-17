const { query } = require('../common/db');

async function getSettings() {
  const rows = await query(
    `
      SELECT
        MaCaiDat AS id,
        TenCongTy AS companyName,
        SoDienThoai AS phone,
        EmailLienHe AS email,
        DiaChi AS address,
        ThongBaoEmail AS notifEmail,
        CanhBaoDangKiem AS notifExpiry,
        CanhBaoHopDong AS notifContract,
        SoNgayCanhBaoDangKiem AS daysWarning
      FROM CaiDatHeThong
      WHERE MaCaiDat = 1
      LIMIT 1
    `,
  );

  return rows[0] || null;
}

async function upsertSettings(payload) {
  await query(
    `
      INSERT INTO CaiDatHeThong (
        MaCaiDat,
        TenCongTy,
        SoDienThoai,
        EmailLienHe,
        DiaChi,
        ThongBaoEmail,
        CanhBaoDangKiem,
        CanhBaoHopDong,
        SoNgayCanhBaoDangKiem
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        TenCongTy = VALUES(TenCongTy),
        SoDienThoai = VALUES(SoDienThoai),
        EmailLienHe = VALUES(EmailLienHe),
        DiaChi = VALUES(DiaChi),
        ThongBaoEmail = VALUES(ThongBaoEmail),
        CanhBaoDangKiem = VALUES(CanhBaoDangKiem),
        CanhBaoHopDong = VALUES(CanhBaoHopDong),
        SoNgayCanhBaoDangKiem = VALUES(SoNgayCanhBaoDangKiem),
        UpdatedAt = CURRENT_TIMESTAMP
    `,
    [
      payload.companyName,
      payload.phone,
      payload.email,
      payload.address,
      Boolean(payload.notifEmail),
      Boolean(payload.notifExpiry),
      Boolean(payload.notifContract),
      Number(payload.daysWarning || 30),
    ],
  );

  return getSettings();
}

module.exports = {
  getSettings,
  upsertSettings,
};
