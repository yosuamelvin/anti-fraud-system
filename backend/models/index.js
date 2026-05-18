const { sequelize } = require('../config/database');
const User = require('./User');
const Case = require('./Case');
const EmailThread = require('./EmailThread');
const ActivityLog = require('./ActivityLog');
const Notification = require('./Notification');
const Holiday = require('./Holiday');

// Associations

// User - Case (investigator)
User.hasMany(Case, {
  foreignKey: 'investigator_id',
  as: 'cases_as_investigator'
});
Case.belongsTo(User, {
  foreignKey: 'investigator_id',
  as: 'investigator'
});

// User - Case (assigned by)
User.hasMany(Case, {
  foreignKey: 'assigned_by_id',
  as: 'cases_assigned'
});
Case.belongsTo(User, {
  foreignKey: 'assigned_by_id',
  as: 'assigned_by'
});

// Case - EmailThread
Case.hasMany(EmailThread, {
  foreignKey: 'case_id',
  as: 'email_threads'
});
EmailThread.belongsTo(Case, {
  foreignKey: 'case_id',
  as: 'case'
});

// Case - ActivityLog
Case.hasMany(ActivityLog, {
  foreignKey: 'case_id',
  as: 'activity_logs'
});
ActivityLog.belongsTo(Case, {
  foreignKey: 'case_id',
  as: 'case'
});

// User - ActivityLog
User.hasMany(ActivityLog, {
  foreignKey: 'user_id',
  as: 'activities'
});
ActivityLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Notification
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications'
});
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Case - Notification
Case.hasMany(Notification, {
  foreignKey: 'case_id',
  as: 'notifications'
});
Notification.belongsTo(Case, {
  foreignKey: 'case_id',
  as: 'case'
});

module.exports = {
  sequelize,
  User,
  Case,
  EmailThread,
  ActivityLog,
  Notification,
  Holiday
};