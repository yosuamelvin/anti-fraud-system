const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  nama_hari_libur: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'holidays',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Holiday;