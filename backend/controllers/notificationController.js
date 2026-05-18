const { Notification, Case, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get user notifications
 */
const getNotifications = async (req, res) => {
  try {
    const { is_read, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      user_id: req.user.id
    };

    if (is_read !== undefined) {
      where.is_read = is_read === 'true';
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'nomor_tiket', 'status_kasus']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        notifications: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error get notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification tidak ditemukan'
      });
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({
      success: true,
      message: 'Notification ditandai sudah dibaca',
      data: notification
    });

  } catch (error) {
    console.error('Error mark as read:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Mark all as read
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          user_id: req.user.id,
          is_read: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Semua notification ditandai sudah dibaca'
    });

  } catch (error) {
    console.error('Error mark all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/**
 * Get unread count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false
      }
    });

    res.json({
      success: true,
      data: {
        unread_count: count
      }
    });

  } catch (error) {
    console.error('Error get unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};