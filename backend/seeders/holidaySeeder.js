const { Holiday } = require('../models');
const axios = require('axios');

/**
 * Fetch hari libur dari API Hari Libur Indonesia
 * API: https://api-harilibur.vercel.app/
 * Free & Auto-update setiap tahun
 */
const fetchHolidaysFromAPI = async (year) => {
  try {
    const response = await axios.get(`https://api-harilibur.vercel.app/api?year=${year}`);
    
    if (response.data && Array.isArray(response.data)) {
      return response.data
        .filter(holiday => holiday.is_national_holiday) // Hanya hari libur nasional
        .map(holiday => ({
          tanggal: holiday.holiday_date,
          nama_libur: holiday.holiday_name,
          keterangan: 'Libur Nasional'
        }));
    }
    
    return [];
  } catch (error) {
    console.log(`⚠️  Tidak bisa fetch API untuk tahun ${year}:`, error.message);
    return null;
  }
};

/**
 * Manual fallback data untuk tahun 2026
 * Digunakan kalau API down atau gagal
 */
const manualHolidays2026 = [
  { tanggal: '2026-01-01', nama_libur: 'Tahun Baru Masehi', keterangan: 'Libur Nasional' },
  { tanggal: '2026-01-17', nama_libur: 'Tahun Baru Imlek', keterangan: 'Libur Nasional' },
  { tanggal: '2026-02-17', nama_libur: 'Isra Mikraj', keterangan: 'Libur Nasional' },
  { tanggal: '2026-03-03', nama_libur: 'Wafat Isa Al Masih', keterangan: 'Libur Nasional' },
  { tanggal: '2026-03-20', nama_libur: 'Hari Raya Idul Fitri', keterangan: 'Libur Nasional' },
  { tanggal: '2026-03-21', nama_libur: 'Hari Raya Idul Fitri', keterangan: 'Libur Nasional' },
  { tanggal: '2026-03-22', nama_libur: 'Hari Raya Nyepi', keterangan: 'Libur Nasional' },
  { tanggal: '2026-05-01', nama_libur: 'Hari Buruh Internasional', keterangan: 'Libur Nasional' },
  { tanggal: '2026-05-02', nama_libur: 'Hari Raya Waisak', keterangan: 'Libur Nasional' },
  { tanggal: '2026-05-14', nama_libur: 'Kenaikan Isa Al Masih', keterangan: 'Libur Nasional' },
  { tanggal: '2026-05-27', nama_libur: 'Hari Raya Idul Adha', keterangan: 'Libur Nasional' },
  { tanggal: '2026-06-01', nama_libur: 'Hari Lahir Pancasila', keterangan: 'Libur Nasional' },
  { tanggal: '2026-06-17', nama_libur: 'Tahun Baru Islam', keterangan: 'Libur Nasional' },
  { tanggal: '2026-08-17', nama_libur: 'Hari Kemerdekaan RI', keterangan: 'Libur Nasional' },
  { tanggal: '2026-08-26', nama_libur: 'Maulid Nabi Muhammad', keterangan: 'Libur Nasional' },
  { tanggal: '2026-12-25', nama_libur: 'Hari Raya Natal', keterangan: 'Libur Nasional' }
];

/**
 * Manual fallback data untuk tahun 2027
 */
const manualHolidays2027 = [
  { tanggal: '2027-01-01', nama_libur: 'Tahun Baru Masehi', keterangan: 'Libur Nasional' },
  { tanggal: '2027-02-06', nama_libur: 'Tahun Baru Imlek', keterangan: 'Libur Nasional' },
  { tanggal: '2027-02-06', nama_libur: 'Isra Mikraj', keterangan: 'Libur Nasional' },
  { tanggal: '2027-03-10', nama_libur: 'Hari Raya Idul Fitri', keterangan: 'Libur Nasional' },
  { tanggal: '2027-03-11', nama_libur: 'Hari Raya Idul Fitri', keterangan: 'Libur Nasional' },
  { tanggal: '2027-03-11', nama_libur: 'Hari Raya Nyepi', keterangan: 'Libur Nasional' },
  { tanggal: '2027-04-02', nama_libur: 'Wafat Isa Al Masih', keterangan: 'Libur Nasional' },
  { tanggal: '2027-05-01', nama_libur: 'Hari Buruh Internasional', keterangan: 'Libur Nasional' },
  { tanggal: '2027-05-16', nama_libur: 'Hari Raya Idul Adha', keterangan: 'Libur Nasional' },
  { tanggal: '2027-05-21', nama_libur: 'Hari Raya Waisak', keterangan: 'Libur Nasional' },
  { tanggal: '2027-05-27', nama_libur: 'Kenaikan Isa Al Masih', keterangan: 'Libur Nasional' },
  { tanggal: '2027-06-01', nama_libur: 'Hari Lahir Pancasila', keterangan: 'Libur Nasional' },
  { tanggal: '2027-06-07', nama_libur: 'Tahun Baru Islam', keterangan: 'Libur Nasional' },
  { tanggal: '2027-08-15', nama_libur: 'Maulid Nabi Muhammad', keterangan: 'Libur Nasional' },
  { tanggal: '2027-08-17', nama_libur: 'Hari Kemerdekaan RI', keterangan: 'Libur Nasional' },
  { tanggal: '2027-12-25', nama_libur: 'Hari Raya Natal', keterangan: 'Libur Nasional' }
];

/**
 * Seed hari libur untuk multiple years
 * Default: seed 2 tahun (current year + next year)
 */
const seedHolidays = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const yearsToSeed = [currentYear, currentYear + 1]; // 2026 & 2027
    
    let totalSeeded = 0;
    
    for (const year of yearsToSeed) {
      console.log(`\n🔄 Fetching hari libur untuk tahun ${year}...`);
      
      // Cek apakah sudah ada data untuk tahun ini
      const existingCount = await Holiday.count({
        where: {
          tanggal: {
            [require('sequelize').Op.gte]: `${year}-01-01`,
            [require('sequelize').Op.lte]: `${year}-12-31`
          }
        }
      });
      
      if (existingCount > 0) {
        console.log(`⚠️  Hari libur tahun ${year} sudah ada (${existingCount} entries). Skip.`);
        continue;
      }
      
      // Fetch dari API
      let holidays = await fetchHolidaysFromAPI(year);
      
      // Kalau API gagal dan year = 2026, pakai manual data
      if (!holidays && year === 2026) {
        if (year === 2026) {
        console.log(`📋 Menggunakan data manual untuk tahun ${year}`);
        holidays = manualHolidays2026;
      } else if (year === 2027) {
        console.log(`📋 Menggunakan data manual untuk tahun ${year}`);
        holidays = manualHolidays2027;
      }
    }
      
      // Skip kalau tidak ada data
      if (!holidays || holidays.length === 0) {
        console.log(`⚠️  Tidak ada data hari libur untuk tahun ${year}`);
        continue;
      }
      
      // Insert ke database
      await Holiday.bulkCreate(holidays);
      totalSeeded += holidays.length;
      console.log(`✅ Berhasil seed ${holidays.length} hari libur untuk tahun ${year}`);
    }
    
    if (totalSeeded > 0) {
      console.log(`\n🎉 Total ${totalSeeded} hari libur berhasil di-seed!`);
    } else {
      console.log('\n✅ Semua hari libur sudah up-to-date!');
    }
    
  } catch (error) {
    console.error('❌ Error seeding holidays:', error.message);
  }
};

/**
 * Function untuk update holiday calendar setiap tahun
 * Bisa dipanggil manual atau via cron job
 */
const updateHolidayCalendar = async () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  console.log(`\n🔄 Checking holiday calendar for ${currentYear} & ${nextYear}...`);
  await seedHolidays();
};

module.exports = { seedHolidays, updateHolidayCalendar };