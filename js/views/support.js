var Modal = require('./modal');
var template = require('../../templates/support.hbs');

var SupportModal = Modal.extend({
  id: 'support',
  template: template,
  ui: { close: true }
});

module.exports = SupportModal;
