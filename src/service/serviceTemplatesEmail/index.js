const TemplatesEmailShow = require('./templatesEmailShow');
const TemplatesEmailCreate = require('./templatesEmailCreate');
const TemplatesEmailUpdate = require('./templatesEmailUpdate');
const TemplatesEmailDelete = require('./templatesEmailDelete');

const templatesEmailShow = new TemplatesEmailShow();
const templatesEmailCreate = new TemplatesEmailCreate();
const templatesEmailUpdate = new TemplatesEmailUpdate();
const templatesEmailDelete = new TemplatesEmailDelete();

module.exports = {
  templatesEmailShow,
  templatesEmailCreate,
  templatesEmailUpdate,
  templatesEmailDelete
};