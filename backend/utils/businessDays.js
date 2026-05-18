const moment = require('moment');
const { Holiday } = require('../models');

/**
 * Cek apakah tanggal adalah hari kerja (Senin-Jumat, bukan hari libur)
 */
const isBusinessDay = async (date) => {
  const momentDate = moment(date);
  
  // Cek weekend (Sabtu = 6, Minggu = 0)
  const dayOfWeek = momentDate.day();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Cek hari libur nasional
  const dateOnly = momentDate.format('YYYY-MM-DD');
  const holiday = await Holiday.findOne({
    where: { tanggal: dateOnly }
  });

  return !holiday;
};

/**
 * Tambah hari kerja ke tanggal
 * @param {Date} startDate - Tanggal mulai
 * @param {Number} businessDaysToAdd - Jumlah hari kerja yang mau ditambahkan
 */
const addBusinessDays = async (startDate, businessDaysToAdd) => {
  let currentDate = moment(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDaysToAdd) {
    currentDate.add(1, 'days');
    
    if (await isBusinessDay(currentDate.toDate())) {
      daysAdded++;
    }
  }

  return currentDate.toDate();
};

/**
 * Hitung sisa hari kerja dari sekarang ke target date
 */
const calculateRemainingBusinessDays = async (targetDate) => {
  const now = moment();
  const target = moment(targetDate);
  
  if (target.isBefore(now, 'day')) {
    return 0; // Sudah overdue
  }

  let currentDate = moment(now);
  let businessDays = 0;

  while (currentDate.isBefore(target, 'day')) {
    currentDate.add(1, 'days');
    
    if (await isBusinessDay(currentDate.toDate())) {
      businessDays++;
    }
  }

  return businessDays;
};

/**
 * Hitung status SLA berdasarkan deadline
 */
const calculateSLAStatus = async (targetDate, slaHari) => {
  const remainingDays = await calculateRemainingBusinessDays(targetDate);
  
  if (remainingDays === 0) {
    return 'Overdue';
  } else if (remainingDays <= 2) {
    return 'Warning';
  } else {
    return 'On Track';
  }
};

module.exports = {
  isBusinessDay,
  addBusinessDays,
  calculateRemainingBusinessDays,
  calculateSLAStatus
};