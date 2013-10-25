var ProfileModal = require('./profileModal');
var CaptureModal = require('./captureModal');
var AboutModal = require('./aboutModal');
var template = require('../../templates/controls.hbs');

var ControlsView = Backbone.View.extend({

  id: 'controls',

  events: {
    'click .comment': 'addCapture',
    'touchstart .comment': 'addCapture',
    'click .info': 'showInfo',
    'touchstart .info': 'showInfo',
    'click .settings': 'setProfile',
    'touchstart .settings': 'setProfile',
    'click .center': 'centerPlayer',
    'touchstart .center': 'centerPlayer',
    'click .camera': 'askSupport',
    'touchstart .camera': 'askSupport',
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.append(template());
    $('body').append(this.el);
  },

  hide: function(){
    this.$el.hide();
  },

  show: function(){
    this.$el.show();
  },

  addCapture: function() {
    //FIXME
    //new CaptureModal({ player: this.options.player });
  },

  centerPlayer: function() {
    window.foo = this.options.player.currentPosition();
    this.options.map.panTo(this.options.player.currentPosition().getLatlng());
  },

  setProfile: function() {
    new ProfileModal({ player: this.options.player });
  },

  showInfo: function() {
    new AboutModal();
  },

  askSupport: function() {
    new SupportModal();
  }

});

module.exports = ControlsView;
