const { User } = require('../models');

const defaultUsers = [
  {
    nama_lengkap: 'Ahmad Rizki',
    email: 'investigator1@antifraud.com',
    password: 'investigator123',
    role: 'investigator'
  },
  {
    nama_lengkap: 'Siti Nurhaliza',
    email: 'investigator2@antifraud.com',
    password: 'investigator123',
    role: 'investigator'
  },
  {
    nama_lengkap: 'Budi Santoso',
    email: 'investigator3@antifraud.com',
    password: 'investigator123',
    role: 'investigator'
  },
  {
    nama_lengkap: 'Diana Wijaya',
    email: 'investigator4@antifraud.com',
    password: 'investigator123',
    role: 'investigator'
  },
  {
    nama_lengkap: 'Eko Prasetyo',
    email: 'kepala.dept@antifraud.com',
    password: 'kepaladept123',
    role: 'kepala_departemen'
  },
  {
    nama_lengkap: 'Fitriani Kusuma',
    email: 'kepala.divisi@antifraud.com',
    password: 'kepaladiv123',
    role: 'kepala_divisi'
  },
  {
    nama_lengkap: 'Hendra Gunawan',
    email: 'direktur@antifraud.com',
    password: 'direktur123',
    role: 'direktur'
  },
  {
    nama_lengkap: 'Irfan Hakim',
    email: 'presdir@antifraud.com',
    password: 'presdir123',
    role: 'presiden_direktur'
  },
  {
    nama_lengkap: 'System Administrator',
    email: 'admin@antifraud.com',
    password: 'admin123',
    role: 'superuser'
  }
];

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({
        where: {
          email: userData.email
        }
      });

      if (!existingUser) {
        await User.create({
          nama_lengkap: userData.nama_lengkap,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          is_active: true
        });

        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ User seeding completed');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

module.exports = { seedUsers };