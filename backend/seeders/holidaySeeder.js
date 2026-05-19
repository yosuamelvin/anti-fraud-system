const axios = require('axios');
const { Holiday } = require('../models');

const seedHolidays = async () => {
  try {
    console.log('🌱 Starting holiday auto-sync...');

    const response = await axios.get('https://api-harilibur.vercel.app/api', {
      timeout: 15000,
    });

    const data = response.data;

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response');
    }

    const holidays = [];

    // 🔥 AUTO DETECT ALL YEARS FROM API
    const years = Object.keys(data);

    console.log('📅 Years found in API:', years);

    for (const year of years) {
      const yearData = data[year];

      if (!yearData || typeof yearData !== 'object') continue;

      for (const [date, holiday] of Object.entries(yearData)) {
        holidays.push({
          tanggal: date,
          nama_hari_libur: holiday?.localName || holiday?.name || 'Holiday',
          keterangan:
            holiday?.description ||
            `${holiday?.localName || holiday?.name || 'Holiday'} - ${year}`,
          is_active: true,
        });
      }
    }

    console.log(`📦 Syncing ${holidays.length} holidays...`);

    // 🔥 UPSERT LOOP (NO DUPLICATE, ALWAYS SYNC)
    for (const h of holidays) {
      await Holiday.upsert({
        tanggal: h.tanggal,
        nama_hari_libur: h.nama_hari_libur,
        keterangan: h.keterangan,
        is_active: h.is_active,
      });
    }

    console.log('✅ Auto-sync completed successfully');
  } catch (error) {
    console.error('❌ Holiday sync failed:', error.message);

    // fallback minimal safety net
    const fallback = [
      {
        tanggal: '2026-01-01',
        nama_hari_libur: 'Tahun Baru',
        keterangan: 'Fallback Data',
      },
      {
        tanggal: '2026-08-17',
        nama_hari_libur: 'Kemerdekaan RI',
        keterangan: 'Fallback Data',
      },
    ];

    for (const h of fallback) {
      await Holiday.upsert({
        tanggal: h.tanggal,
        nama_hari_libur: h.nama_hari_libur,
        keterangan: h.keterangan,
        is_active: true,
      });
    }

    console.log('⚠️ Fallback sync executed');
  }
};

module.exports = { seedHolidays };