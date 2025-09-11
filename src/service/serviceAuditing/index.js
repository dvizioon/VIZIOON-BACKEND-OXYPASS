const AuditingShow = require('./auditingShow');
const AuditingCreate = require('./auditingCreate');
const AuditingUpdate = require('./auditingUpdate');
const AuditingDelete = require('./auditingDelete');

const auditingShow = new AuditingShow();
const auditingCreate = new AuditingCreate();
const auditingUpdate = new AuditingUpdate();
const auditingDelete = new AuditingDelete();

module.exports = {
  auditingShow,
  auditingCreate,
  auditingUpdate,
  auditingDelete
};