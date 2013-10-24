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
    'click .center': 'centerPlayer',
    'touchstart .center': 'centerPlayer',
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.append(template());
    $('body').append(this.el);
  },

  addCapture: function() {
    new CaptureModal({ player: this.options.player });
  },

  centerPlayer: function() {
    window.foo = this.options.player.currentPosition();
    this.options.map.panTo(this.options.player.currentPosition().getLatlng());
  },

  setProfile: function() {
    new ProfileModal({ player: this.options.player });
  },

  showAbout: function() {
    new AboutModal();
  }

});

module.exports = ControlsView;
