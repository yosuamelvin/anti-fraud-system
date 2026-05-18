const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { Case, EmailThread, Notification, ActivityLog, User } = require('../models');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { addBusinessDays } = require('../utils/businessDays');
const { Op } = require('sequelize');

class EmailService {
  constructor() {
    this.imap = null;
    this.isConnected = false;
    this.isProcessing = false;
  }

  /**
   * Initialize IMAP connection
   */
  connect() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
      port: process.env.EMAIL_IMAP_PORT || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    this.imap.once('ready', () => {
      console.log('✅ Email service connected');
      this.isConnected = true;
      this.openInbox();
    });

    this.imap.once('error', (err) => {
      console.error('❌ Email connection error:', err.message);
      this.isConnected = false;
    });

    this.imap.once('end', () => {
      console.log('⚠️  Email connection ended');
      this.isConnected = false;
      // Reconnect after 30 seconds
      setTimeout(() => {
        console.log('🔄 Reconnecting to email server...');
        this.connect();
      }, 30000);
    });

    this.imap.connect();
  }

  /**
   * Open inbox and start listening for new emails
   */
  openInbox() {
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('❌ Error opening inbox:', err.message);
        return;
      }

      console.log('📬 Inbox opened, monitoring for new emails...');

      // Listen for new emails
      this.imap.on('mail', () => {
        console.log('📨 New email detected!');
        this.processNewEmails();
      });

      // Process existing unread emails on startup
      this.processNewEmails();
    });
  }

  /**
   * Process new unread emails
   */
  async processNewEmails() {
    if (this.isProcessing) {
      console.log('⏳ Already processing emails, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      this.imap.search(['UNSEEN'], async (err, results) => {
        if (err) {
          console.error('❌ Error searching emails:', err.message);
          this.isProcessing = false;
          return;
        }

        if (!results || results.length === 0) {
          console.log('📭 No new emails');
          this.isProcessing = false;
          return;
        }

        console.log(`📬 Found ${results.length} unread email(s)`);

        const fetch = this.imap.fetch(results, { bodies: '' });

        fetch.on('message', (msg, seqno) => {
          msg.on('body', async (stream, info) => {
            try {
              const parsed = await simpleParser(stream);
              await this.handleEmail(parsed);
            } catch (error) {
              console.error('❌ Error parsing email:', error.message);
            }
          });

          msg.once('attributes', (attrs) => {
            // Mark as seen after processing
            this.imap.addFlags(attrs.uid, ['\\Seen'], (err) => {
              if (err) console.error('❌ Error marking email as read:', err.message);
            });
          });
        });

        fetch.once('error', (err) => {
          console.error('❌ Fetch error:', err.message);
        });

        fetch.once('end', () => {
          console.log('✅ Email processing complete');
          this.isProcessing = false;
        });
      });
    } catch (error) {
      console.error('❌ Error in processNewEmails:', error.message);
      this.isProcessing = false;
    }
  }

  /**
   * Handle individual email and create case
   */
  async handleEmail(email) {
    try {
      const emailFrom = email.from?.value?.[0]?.address || email.from?.text || 'unknown';
      const emailTo = email.to?.value?.[0]?.address || process.env.EMAIL_USER;
      const subject = email.subject || '(No Subject)';
      const body = email.text || email.html || '';
      const emailDate = email.date || new Date();

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📨 Processing Email:');
      console.log(`   From: ${emailFrom}`);
      console.log(`   Subject: ${subject}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Check if case already exists for this email
      const existingCase = await Case.findOne({
        where: {
          email_pelapor: emailFrom,
          subject_laporan: subject
        }
      });

      let caseRecord;
      let isNewCase = false;

      if (existingCase) {
        // Add to existing thread
        caseRecord = existingCase;
        console.log(`📎 Adding to existing case: ${caseRecord.nomor_tiket}`);
        
        // Update total email count
        await caseRecord.update({
          total_email: caseRecord.total_email + 1
        });
      } else {
        // Create new case
        isNewCase = true;
        const nomorTiket = await generateTicketNumber();
        
        // Determine SLA based on cabang (default: Non SPD = 3 days)
        const slaHari = 3; // Will be updated when cabang is assigned
        const targetDate = await addBusinessDays(new Date(), slaHari);

        caseRecord = await Case.create({
          nomor_tiket: nomorTiket,
          tanggal_pelaporan: emailDate,
          sumber_laporan: 'Email',
          email_pelapor: emailFrom,
          subject_laporan: subject,
          spd_non_spd: 'Non SPD', // Default, will be updated manually
          cabang: 'Head Office', // Default, will be updated manually
          status_kasus: 'Unassigned',
          sla_hari: slaHari,
          target_date: targetDate,
          status_sla: 'On Track',
          total_email: 1
        });

        console.log(`✅ New case created: ${nomorTiket}`);
      }

      // Save email thread
      await EmailThread.create({
        case_id: caseRecord.id,
        email_from: emailFrom,
        email_to: emailTo,
        subject: subject,
        body: body,
        email_date: emailDate,
        has_attachment: email.attachments && email.attachments.length > 0,
        attachment_count: email.attachments ? email.attachments.length : 0
      });

      console.log('✅ Email thread saved');

      // Create notifications for new case only
      if (isNewCase) {
        await this.createNotifications(caseRecord);
        
        // Create activity log
        await ActivityLog.create({
          case_id: caseRecord.id,
          user_id: null, // System generated
          action: 'create_case',
          description: `Case baru dibuat dari email: ${emailFrom}`
        });

        console.log('✅ Notifications sent');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('❌ Error handling email:', error.message);
      console.error(error.stack);
    }
  }

  /**
   * Create notifications for relevant users
   */
  async createNotifications(caseRecord) {
    try {
      // Get users: Kepala Divisi, Kepala Departemen, dan semua Investigator
      const users = await User.findAll({
        where: {
          role: {
            [Op.in]: ['kepala_divisi', 'kepala_departemen', 'investigator']
          },
          is_active: true
        }
      });

      const notifications = users.map(user => ({
        user_id: user.id,
        case_id: caseRecord.id,
        title: 'Case Baru Masuk',
        message: `Case baru dari ${caseRecord.email_pelapor}: ${caseRecord.subject_laporan}`,
        type: 'new_case',
        is_read: false
      }));

      await Notification.bulkCreate(notifications);

      console.log(`✅ Created ${notifications.length} notifications`);
    } catch (error) {
      console.error('❌ Error creating notifications:', error.message);
    }
  }

  /**
   * Disconnect email service
   */
  disconnect() {
    if (this.imap) {
      this.imap.end();
      console.log('📪 Email service disconnected');
    }
  }
}

// Singleton instance
const emailService = new EmailService();

// Start monitoring function
const startEmailMonitoring = () => {
  emailService.connect();
};

module.exports = {
  startEmailMonitoring
};