const WebServiceShow = require('./webServiceShow');
const WebServiceCreate = require('./webServiceCreate');
const WebServiceUpdate = require('./webServiceUpdate');
const WebServiceDelete = require('./webServiceDelete');

const webServiceShow = new WebServiceShow();
const webServiceCreate = new WebServiceCreate();
const webServiceUpdate = new WebServiceUpdate();
const webServiceDelete = new WebServiceDelete();

module.exports = {
  webServiceShow,
  webServiceCreate,
  webServiceUpdate,
  webServiceDelete
};