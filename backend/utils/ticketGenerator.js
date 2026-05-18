const { Case } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate nomor tiket otomatis
 * Format: AFM/INV/CASE/MMYY/XXX
 * Contoh: AFM/INV/CASE/0524/001
 */
const generateTicketNumber = async () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const prefix = `AFM/INV/CASE/${month}${year}/`;

  // Cari tiket terakhir bulan ini
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const lastCase = await Case.findOne({
    where: {
      created_at: {
        [Op.between]: [startOfMonth, endOfMonth]
      }
    },
    order: [['created_at', 'DESC']]
  });

  let sequence = 1;
  if (lastCase && lastCase.nomor_tiket) {
    // Extract sequence dari tiket terakhir
    const lastSequence = lastCase.nomor_tiket.split('/').pop();
    sequence = parseInt(lastSequence) + 1;
  }

  const sequenceStr = String(sequence).padStart(3, '0');
  return `${prefix}${sequenceStr}`;
};

module.exports = { generateTicketNumber };