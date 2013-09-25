var Modal = require('./modal');
var template = require('../../templates/about.hbs');

var AboutModal = Modal.extend({
  id: 'about',
  template: template,
  ui: { close: true, submit: false }
});

module.exports = AboutModal;
