const axios = require('axios');
const { Holiday } = require('../models');

/**
 * Fetch holidays from API and seed database
 */
const seedHolidays = async () => {
  try {
    console.log('🌱 Seeding holidays...');

    // Check if holidays already exist
    const existingCount = await Holiday.count();
    
    if (existingCount > 0) {
      console.log(`ℹ️  Holidays already seeded (${existingCount} records)`);
      return;
    }

    // Fetch from API
    console.log('📡 Fetching holidays from API...');
    
    const response = await axios.get('https://api-harilibur.vercel.app/api', {
      timeout: 10000 // 10 second timeout
    });

    if (!response.data) {
      throw new Error('No data received from API');
    }

    const holidays = [];
    const currentYear = new Date().getFullYear();

    // Process holidays for current year and next year
    for (let year = currentYear; year <= currentYear + 1; year++) {
      const yearData = response.data[year];
      
      if (!yearData) {
        console.log(`⚠️  No data for year ${year}`);
        continue;
      }

      for (const [date, holiday] of Object.entries(yearData)) {
        holidays.push({
          tanggal: new Date(date),
          nama_hari_libur: holiday.localName || holiday.name || 'Holiday',
          keterangan: holiday.description || `${holiday.localName || holiday.name} - ${year}`,
          is_active: true
        });
      }
    }

    if (holidays.length === 0) {
      console.log('⚠️  No holidays to seed, using fallback data');
      
      // Fallback: Manual Indonesian holidays for 2025-2026
      const fallbackHolidays = [
        // 2025
        { tanggal: '2025-01-01', nama_hari_libur: 'Tahun Baru 2025', keterangan: 'Tahun Baru Masehi' },
        { tanggal: '2025-03-29', nama_hari_libur: 'Isra Miraj', keterangan: 'Isra Miraj Nabi Muhammad SAW' },
        { tanggal: '2025-03-31', nama_hari_libur: 'Idul Fitri', keterangan: 'Hari Raya Idul Fitri 1446 H' },
        { tanggal: '2025-04-01', nama_hari_libur: 'Idul Fitri', keterangan: 'Hari Raya Idul Fitri 1446 H' },
        { tanggal: '2025-04-18', nama_hari_libur: 'Wafat Isa Almasih', keterangan: 'Wafat Isa Almasih' },
        { tanggal: '2025-05-01', nama_hari_libur: 'Hari Buruh', keterangan: 'Hari Buruh Internasional' },
        { tanggal: '2025-05-29', nama_hari_libur: 'Kenaikan Isa Almasih', keterangan: 'Kenaikan Isa Almasih' },
        { tanggal: '2025-06-01', nama_hari_libur: 'Hari Lahir Pancasila', keterangan: 'Hari Lahir Pancasila' },
        { tanggal: '2025-06-07', nama_hari_libur: 'Idul Adha', keterangan: 'Hari Raya Idul Adha 1446 H' },
        { tanggal: '2025-06-28', nama_hari_libur: 'Tahun Baru Islam', keterangan: 'Tahun Baru Islam 1447 H' },
        { tanggal: '2025-08-17', nama_hari_libur: 'Hari Kemerdekaan RI', keterangan: 'Hari Kemerdekaan Republik Indonesia' },
        { tanggal: '2025-09-06', nama_hari_libur: 'Maulid Nabi Muhammad', keterangan: 'Maulid Nabi Muhammad SAW' },
        { tanggal: '2025-12-25', nama_hari_libur: 'Hari Raya Natal', keterangan: 'Hari Raya Natal' },
        
        // 2026
        { tanggal: '2026-01-01', nama_hari_libur: 'Tahun Baru 2026', keterangan: 'Tahun Baru Masehi' },
        { tanggal: '2026-02-17', nama_hari_libur: 'Tahun Baru Imlek', keterangan: 'Tahun Baru Imlek 2577' },
        { tanggal: '2026-03-11', nama_hari_libur: 'Hari Suci Nyepi', keterangan: 'Hari Suci Nyepi Tahun Baru Saka 1948' },
        { tanggal: '2026-03-18', nama_hari_libur: 'Isra Miraj', keterangan: 'Isra Miraj Nabi Muhammad SAW' },
        { tanggal: '2026-03-20', nama_hari_libur: 'Idul Fitri', keterangan: 'Hari Raya Idul Fitri 1447 H' },
        { tanggal: '2026-03-21', nama_hari_libur: 'Idul Fitri', keterangan: 'Hari Raya Idul Fitri 1447 H' },
        { tanggal: '2026-04-03', nama_hari_libur: 'Wafat Isa Almasih', keterangan: 'Wafat Isa Almasih' },
        { tanggal: '2026-05-01', nama_hari_libur: 'Hari Buruh', keterangan: 'Hari Buruh Internasional' },
        { tanggal: '2026-05-14', nama_hari_libur: 'Kenaikan Isa Almasih', keterangan: 'Kenaikan Isa Almasih' },
        { tanggal: '2026-05-27', nama_hari_libur: 'Idul Adha', keterangan: 'Hari Raya Idul Adha 1447 H' },
        { tanggal: '2026-06-01', nama_hari_libur: 'Hari Lahir Pancasila', keterangan: 'Hari Lahir Pancasila' },
        { tanggal: '2026-06-17', nama_hari_libur: 'Tahun Baru Islam', keterangan: 'Tahun Baru Islam 1448 H' },
        { tanggal: '2026-08-17', nama_hari_libur: 'Hari Kemerdekaan RI', keterangan: 'Hari Kemerdekaan Republik Indonesia' },
        { tanggal: '2026-08-26', nama_hari_libur: 'Maulid Nabi Muhammad', keterangan: 'Maulid Nabi Muhammad SAW' },
        { tanggal: '2026-12-25', nama_hari_libur: 'Hari Raya Natal', keterangan: 'Hari Raya Natal' }
      ];

      for (const holiday of fallbackHolidays) {
        holidays.push({
          tanggal: new Date(holiday.tanggal),
          nama_hari_libur: holiday.nama_hari_libur,
          keterangan: holiday.keterangan,
          is_active: true
        });
      }
    }

    // Bulk insert holidays
    await Holiday.bulkCreate(holidays);

    console.log(`✅ Seeded ${holidays.length} holidays`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Holiday seeding completed');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding holidays:', error.message);
    
    // If API fails, use fallback data
    console.log('⚠️  Using fallback holiday data...');
    
    const fallbackHolidays = [
      { tanggal: '2025-01-01', nama_hari_libur: 'Tahun Baru 2025', keterangan: 'Tahun Baru Masehi' },
      { tanggal: '2025-03-31', nama_hari_libur: 'Idul Fitri', keterangan: 'Hari Raya Idul Fitri' },
      { tanggal: '2025-04-01', nama_hari_libur: 'Idul Fitri', keterangan: 'Hari Raya Idul Fitri' },
      { tanggal: '2025-05-01', nama_hari_libur: 'Hari Buruh', keterangan: 'Hari Buruh Internasional' },
      { tanggal: '2025-06-01', nama_hari_libur: 'Hari Lahir Pancasila', keterangan: 'Hari Lahir Pancasila' },
      { tanggal: '2025-08-17', nama_hari_libur: 'Hari Kemerdekaan RI', keterangan: 'Kemerdekaan RI' },
      { tanggal: '2025-12-25', nama_hari_libur: 'Hari Raya Natal', keterangan: 'Hari Raya Natal' },
      { tanggal: '2026-01-01', nama_hari_libur: 'Tahun Baru 2026', keterangan: 'Tahun Baru Masehi' },
      { tanggal: '2026-05-01', nama_hari_libur: 'Hari Buruh', keterangan: 'Hari Buruh Internasional' },
      { tanggal: '2026-08-17', nama_hari_libur: 'Hari Kemerdekaan RI', keterangan: 'Kemerdekaan RI' },
      { tanggal: '2026-12-25', nama_hari_libur: 'Hari Raya Natal', keterangan: 'Hari Raya Natal' }
    ];

    try {
      const holidays = fallbackHolidays.map(h => ({
        tanggal: new Date(h.tanggal),
        nama_hari_libur: h.nama_hari_libur,
        keterangan: h.keterangan,
        is_active: true
      }));

      await Holiday.bulkCreate(holidays);
      console.log(`✅ Seeded ${holidays.length} fallback holidays`);
    } catch (fallbackError) {
      console.error('❌ Fallback seeding also failed:', fallbackError.message);
    }
  }
};

module.exports = { seedHolidays };