var ProfileModal = require('./profileModal');
var CaptureModal = require('./captureModal');
var AboutModal = require('./aboutModal');
var template = require('../../templates/controls.hbs');

var ControlsView = Backbone.View.extend({

  id: 'controls',

  events: {
    'click .capture': 'addCapture',
    'touchstart .capture': 'addCapture',
    'click .about': 'showAbout',
    'touchstart .about': 'showAbout',
    'click .settings': 'setProfile',
    'touchstart .settings': 'setProfile',
    'change .follow-me': 'updateFollowMe'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.append(template());
    $('body').append(this.el);
  },

  addCapture: function() {
    new CaptureModal({ operator: this.options.operator });
  },

  updateFollowMe: function(event) {
    this.options.operator.set('followMe', event.target.checked);
  },

  setProfile: function() {
    new ProfileModal({ operator: this.options.operator });
  },

  showAbout: function() {
    new AboutModal();
  }

});

module.exports = ControlsView;
