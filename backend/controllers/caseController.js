const { Case, EmailThread, ActivityLog, Notification, User } = require('../models');
const { Op } = require('sequelize');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { addBusinessDays, calculateRemainingBusinessDays, calculateSLAStatus } = require('../utils/businessDays');

/**
 * Get all cases with filters
 */
const getAllCases = async (req, res) => {
  try {
    const {
      status,
      investigator_id,
      cabang,
      search,
      month,
      year,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by status
    if (status && status !== 'Semua') {
      where.status_kasus = status;
    }

    // Filter by investigator
    if (investigator_id) {
      where.investigator_id = investigator_id;
    }

    // Filter by cabang
    if (cabang) {
      where.cabang = cabang;
    }

    // Filter by month & year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.tanggal_pelaporan = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Search by nomor tiket, email pelapor, atau subject
    if (search) {
      where[Op.or] = [
        { nomor_tiket: { [Op.iLike]: `%${search}%` } },
        { email_pelapor: { [Op.iLike]: `%${search}%` } },
        { subject_laporan: { [Op.iLike]: `%${search}%` } },
        { terlapor: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Case.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'investigator',
          attributes: ['id', 'nama_lengkap', 'email', 'role']
        },
        {
          model: User,
          as: 'assigned_by',
          attributes: ['id', 'nama_lengkap', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        cases: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error get all cases:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Get case by ID with full details
 */
const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await Case.findByPk(id, {
      include: [
        {
          model: User,
          as: 'investigator',
          attributes: ['id', 'nama_lengkap', 'email', 'role']
        },
        {
          model: User,
          as: 'assigned_by',
          attributes: ['id', 'nama_lengkap', 'email', 'role']
        },
        {
          model: EmailThread,
          as: 'email_threads',
          order: [['email_date', 'ASC']]
        },
        {
          model: ActivityLog,
          as: 'activity_logs',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nama_lengkap', 'role']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case tidak ditemukan'
      });
    }

    // Calculate real-time SLA status
    if (caseData.target_date && caseData.status_kasus !== 'Closed' && caseData.status_kasus !== 'Waiting Info') {
      const remainingDays = await calculateRemainingBusinessDays(caseData.target_date);
      const slaStatus = await calculateSLAStatus(caseData.target_date, caseData.sla_hari);
      
      caseData.dataValues.remaining_days = remainingDays;
      caseData.dataValues.calculated_sla_status = slaStatus;
    }

    res.json({
      success: true,
      data: caseData
    });

  } catch (error) {
    console.error('Error get case by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Create case manually (non-email)
 */
const createCase = async (req, res) => {
  try {
    const {
      tanggal_pelaporan,
      sumber_laporan,
      email_pelapor,
      subject_laporan,
      spd_non_spd,
      cabang,
      nama_debitur,
      nomor_agreement,
      terlapor,
      jabatan_terlapor,
      indikasi_kasus,
      kategori_kasus,
      note
    } = req.body;

    // Validate required fields
    if (!spd_non_spd || !cabang) {
      return res.status(400).json({
        success: false,
        message: 'SPD/Non SPD dan Cabang wajib diisi'
      });
    }

    // Generate nomor tiket
    const nomorTiket = await generateTicketNumber();

    // Determine SLA based on SPD/Non SPD
    const slaHari = spd_non_spd === 'SPD' ? 5 : 3;

    // Calculate target date
    const reportDate = tanggal_pelaporan ? new Date(tanggal_pelaporan) : new Date();
    const targetDate = await addBusinessDays(reportDate, slaHari);

    // Create case
    const newCase = await Case.create({
      nomor_tiket: nomorTiket,
      tanggal_pelaporan: reportDate,
      sumber_laporan: sumber_laporan || 'Manual Input',
      email_pelapor,
      subject_laporan,
      spd_non_spd,
      cabang,
      nama_debitur,
      nomor_agreement,
      terlapor,
      jabatan_terlapor,
      indikasi_kasus,
      kategori_kasus,
      note,
      status_kasus: 'Open', // Manual case langsung Open
      sla_hari: slaHari,
      target_date: targetDate,
      status_sla: 'On Track',
      investigator_id: req.user.id, // Creator = investigator
      total_email: 0
    });

    // Create activity log
    await ActivityLog.create({
      case_id: newCase.id,
      user_id: req.user.id,
      action: 'create_case',
      description: `Case dibuat secara manual oleh ${req.user.nama_lengkap}`
    });

    // Create notification untuk Kepala Divisi & Kepala Departemen
    const supervisors = await User.findAll({
      where: {
        role: {
          [Op.in]: ['kepala_divisi', 'kepala_departemen']
        },
        is_active: true
      }
    });

    const notifications = supervisors.map(user => ({
      user_id: user.id,
      case_id: newCase.id,
      title: 'Case Baru (Manual)',
      message: `Case baru dibuat oleh ${req.user.nama_lengkap} - ${newCase.nomor_tiket}`,
      type: 'new_case'
    }));

    await Notification.bulkCreate(notifications);

    res.status(201).json({
      success: true,
      message: 'Case berhasil dibuat',
      data: newCase
    });

  } catch (error) {
    console.error('Error create case:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Update case
 */
const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const caseData = await Case.findByPk(id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case tidak ditemukan'
      });
    }

    // Store old values for activity log
    const oldValues = { ...caseData.dataValues };

    // Update SLA jika SPD/Non SPD berubah
    if (updateData.spd_non_spd && updateData.spd_non_spd !== caseData.spd_non_spd) {
      updateData.sla_hari = updateData.spd_non_spd === 'SPD' ? 5 : 3;
      updateData.target_date = await addBusinessDays(caseData.tanggal_pelaporan, updateData.sla_hari);
    }

    // Update case
    await caseData.update(updateData);

    // Create activity log
    await ActivityLog.create({
      case_id: caseData.id,
      user_id: req.user.id,
      action: 'update_case',
      description: `Case diupdate oleh ${req.user.nama_lengkap}`,
      old_value: oldValues,
      new_value: updateData
    });

    res.json({
      success: true,
      message: 'Case berhasil diupdate',
      data: caseData
    });

  } catch (error) {
    console.error('Error update case:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Assign case to investigator (Kepala Divisi only)
 */
const assignCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { investigator_id } = req.body;

    // Validate role
    if (req.user.role !== 'kepala_divisi') {
      return res.status(403).json({
        success: false,
        message: 'Hanya Kepala Divisi yang bisa assign case'
      });
    }

    const caseData = await Case.findByPk(id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case tidak ditemukan'
      });
    }

    // Validate investigator exists
    const investigator = await User.findByPk(investigator_id);

    if (!investigator || investigator.role !== 'investigator') {
      return res.status(400).json({
        success: false,
        message: 'Investigator tidak valid'
      });
    }

    // Update case
    await caseData.update({
      investigator_id: investigator_id,
      assigned_by_id: req.user.id,
      assigned_at: new Date(),
      status_kasus: 'Open'
    });

    // Create activity log
    await ActivityLog.create({
      case_id: caseData.id,
      user_id: req.user.id,
      action: 'assign_case',
      description: `Case di-assign ke ${investigator.nama_lengkap} oleh ${req.user.nama_lengkap}`
    });

    // Create notification untuk investigator
    await Notification.create({
      user_id: investigator_id,
      case_id: caseData.id,
      title: 'Case Baru Di-Assign',
      message: `Case ${caseData.nomor_tiket} telah di-assign kepada Anda`,
      type: 'case_assigned'
    });

    res.json({
      success: true,
      message: 'Case berhasil di-assign',
      data: caseData
    });

  } catch (error) {
    console.error('Error assign case:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Change case status
 */
const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Unassigned', 'Open', 'Closed', 'Waiting Info'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const caseData = await Case.findByPk(id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case tidak ditemukan'
      });
    }

    const oldStatus = caseData.status_kasus;
    const updateData = { status_kasus: status };

    // If closed, set closed_at
    if (status === 'Closed') {
      updateData.closed_at = new Date();
    }

    // Add note if provided
    if (note) {
      updateData.note = note;
    }

    await caseData.update(updateData);

    // Create activity log
    await ActivityLog.create({
      case_id: caseData.id,
      user_id: req.user.id,
      action: 'change_status',
      description: `Status diubah dari ${oldStatus} ke ${status} oleh ${req.user.nama_lengkap}`,
      old_value: { status: oldStatus },
      new_value: { status: status }
    });

    res.json({
      success: true,
      message: 'Status berhasil diubah',
      data: caseData
    });

  } catch (error) {
    console.error('Error change status:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Get my cases (untuk investigator)
 */
const getMyCases = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      investigator_id: req.user.id
    };

    if (status && status !== 'Semua') {
      where.status_kasus = status;
    }

    const { count, rows } = await Case.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assigned_by',
          attributes: ['id', 'nama_lengkap', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        cases: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error get my cases:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    // Date range untuk bulan ini
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const where = {
      tanggal_pelaporan: {
        [Op.between]: [startDate, endDate]
      }
    };

    // Count by status
    const unassignedCount = await Case.count({
      where: { ...where, status_kasus: 'Unassigned' }
    });

    const openCount = await Case.count({
      where: { ...where, status_kasus: 'Open' }
    });

    const closedCount = await Case.count({
      where: { ...where, status_kasus: 'Closed' }
    });

    const waitingInfoCount = await Case.count({
      where: { ...where, status_kasus: 'Waiting Info' }
    });

    // Count total cases this month
    const totalCases = await Case.count({ where });

    // Count cases by SLA status
    const onTrackCount = await Case.count({
      where: { ...where, status_sla: 'On Track', status_kasus: { [Op.ne]: 'Closed' } }
    });

    const warningCount = await Case.count({
      where: { ...where, status_sla: 'Warning', status_kasus: { [Op.ne]: 'Closed' } }
    });

    const overdueCount = await Case.count({
      where: { ...where, status_sla: 'Overdue', status_kasus: { [Op.ne]: 'Closed' } }
    });

    res.json({
      success: true,
      data: {
        period: {
          month: parseInt(currentMonth),
          year: parseInt(currentYear)
        },
        total_cases: totalCases,
        by_status: {
          unassigned: unassignedCount,
          open: openCount,
          closed: closedCount,
          waiting_info: waitingInfoCount
        },
        by_sla: {
          on_track: onTrackCount,
          warning: warningCount,
          overdue: overdueCount
        }
      }
    });

  } catch (error) {
    console.error('Error get dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  assignCase,
  changeStatus,
  getMyCases,
  getDashboardStats
};