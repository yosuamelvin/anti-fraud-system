const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nomor_tiket: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  tanggal_pelaporan: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  sumber_laporan: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Email'
  },
  email_pelapor: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  subject_laporan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  spd_non_spd: {
    type: DataTypes.ENUM('SPD', 'Non SPD'),
    allowNull: false
  },
  cabang: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nama_debitur: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  nomor_agreement: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  terlapor: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  jabatan_terlapor: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  indikasi_kasus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  kategori_kasus: {
    type: DataTypes.ENUM(
      'Manipulation',
      'Kode Etik/Kesalahan Prosedur',
      'Embezzlement',
      'Lainnya'
    ),
    allowNull: true
  },
  fraud_status: {
    type: DataTypes.ENUM('Fraud', 'Non Fraud'),
    allowNull: true
  },
  status_kasus: {
    type: DataTypes.ENUM('Unassigned', 'Open', 'Closed', 'Waiting Info'),
    allowNull: false,
    defaultValue: 'Unassigned'
  },
  sla_hari: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '3 hari untuk Non SPD, 5 hari untuk SPD'
  },
  target_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status_sla: {
    type: DataTypes.ENUM('On Track', 'Warning', 'Overdue'),
    allowNull: false,
    defaultValue: 'On Track'
  },
  tanggal_perpanjangan_sla: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deadline_perpanjangan_sla: {
    type: DataTypes.DATE,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  investigator_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_by_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_email: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'cases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Case;