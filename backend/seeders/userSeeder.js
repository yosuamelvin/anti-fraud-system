const { User } = require('../models');
const bcrypt = require('bcryptjs');

const defaultUsers = [
  // 4 Investigator
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
  // 1 Kepala Departemen
  {
    nama_lengkap: 'Eko Prasetyo',
    email: 'kepala.dept@antifraud.com',
    password: 'kepaladept123',
    role: 'kepala_departemen'
  },
  // 1 Kepala Divisi
  {
    nama_lengkap: 'Fitriani Kusuma',
    email: 'kepala.divisi@antifraud.com',
    password: 'kepaladiv123',
    role: 'kepala_divisi'
  },
  // 1 Direktur
  {
    nama_lengkap: 'Hendra Gunawan',
    email: 'direktur@antifraud.com',
    password: 'direktur123',
    role: 'direktur'
  },
  // 1 President Director
  {
    nama_lengkap: 'Irfan Hakim',
    email: 'presdir@antifraud.com',
    password: 'presdir123',
    role: 'presiden_direktur'
  },
  // 1 Superuser
  {
    nama_lengkap: 'System Administrator',
    email: 'admin@antifraud.com',
    password: 'admin123',
    role: 'superuser'
  }
];

const seedUsers = async () => {
  try {
    // Cek apakah sudah ada user
    const existingUsers = await User.count();
    
    if (existingUsers > 0) {
      console.log('⚠️  User sudah ada di database. Skip seeding.');
      return;
    }

    // Hash password secara manual sebelum insert
    const usersWithHashedPassword = await Promise.all(
      defaultUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert dengan password yang sudah di-hash
    await User.bulkCreate(usersWithHashedPassword, {
      individualHooks: false // Skip hooks karena sudah manual hash
    });

    console.log('✅ Berhasil seed 9 user default!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    defaultUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};

module.exports = { seedUsers };