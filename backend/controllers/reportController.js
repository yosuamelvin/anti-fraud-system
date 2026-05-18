const { Case, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Get case statistics for reports
 */
const getCaseStatistics = async (req, res) => {
  try {
    const { start_date, end_date, cabang, investigator_id } = req.query;

    const where = {};

    // Date range filter
    if (start_date && end_date) {
      where.tanggal_pelaporan = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Cabang filter
    if (cabang) {
      where.cabang = cabang;
    }

    // Investigator filter
    if (investigator_id) {
      where.investigator_id = investigator_id;
    }

    // Total cases
    const totalCases = await Case.count({ where });

    // By status
    const byStatus = await Case.findAll({
      where,
      attributes: [
        'status_kasus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status_kasus'],
      raw: true
    });

    // By SLA
    const bySLA = await Case.findAll({
      where,
      attributes: [
        'status_sla',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status_sla'],
      raw: true
    });

    // By category
    const byCategory = await Case.findAll({
      where,
      attributes: [
        'kategori_kasus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['kategori_kasus'],
      raw: true
    });

    // By cabang (top 10)
    const byCabang = await Case.findAll({
      where,
      attributes: [
        'cabang',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['cabang'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // By investigator
    const byInvestigator = await Case.findAll({
      where,
      include: [{
        model: User,
        as: 'investigator',
        attributes: ['nama_lengkap']
      }],
      attributes: [
        'investigator_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('Case.id')), 'count']
      ],
      group: ['investigator_id', 'investigator.id', 'investigator.nama_lengkap'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('Case.id')), 'DESC']],
      raw: true
    });

    // Cases per month (last 6 months)
    const sixMonthsAgo = moment().subtract(6, 'months').startOf('month').toDate();
    const casesByMonth = await Case.findAll({
      where: {
        tanggal_pelaporan: {
          [Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('tanggal_pelaporan')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('tanggal_pelaporan'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('tanggal_pelaporan')), 'ASC']],
      raw: true
    });

    // Average resolution time (closed cases)
    const closedCases = await Case.findAll({
      where: {
        ...where,
        status_kasus: 'Closed',
        closed_at: { [Op.ne]: null }
      },
      attributes: ['tanggal_pelaporan', 'closed_at'],
      raw: true
    });

    let avgResolutionDays = 0;
    if (closedCases.length > 0) {
      const totalDays = closedCases.reduce((sum, c) => {
        const days = moment(c.closed_at).diff(moment(c.tanggal_pelaporan), 'days');
        return sum + days;
      }, 0);
      avgResolutionDays = Math.round(totalDays / closedCases.length);
    }

    res.json({
      success: true,
      data: {
        summary: {
          total_cases: totalCases,
          avg_resolution_days: avgResolutionDays,
          closed_cases: closedCases.length
        },
        by_status: byStatus,
        by_sla: bySLA,
        by_category: byCategory,
        by_cabang: byCabang,
        by_investigator: byInvestigator,
        by_month: casesByMonth
      }
    });

  } catch (error) {
    console.error('Error get case statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Export cases to JSON (untuk Excel/PDF di frontend)
 */
const exportCases = async (req, res) => {
  try {
    const { start_date, end_date, status, cabang } = req.query;

    const where = {};

    if (start_date && end_date) {
      where.tanggal_pelaporan = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    if (status && status !== 'Semua') {
      where.status_kasus = status;
    }

    if (cabang) {
      where.cabang = cabang;
    }

    const cases = await Case.findAll({
      where,
      include: [
        {
          model: User,
          as: 'investigator',
          attributes: ['nama_lengkap', 'email']
        },
        {
          model: User,
          as: 'assigned_by',
          attributes: ['nama_lengkap']
        }
      ],
      order: [['tanggal_pelaporan', 'DESC']]
    });

    res.json({
      success: true,
      data: cases
    });

  } catch (error) {
    console.error('Error export cases:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

module.exports = {
  getCaseStatistics,
  exportCases
};