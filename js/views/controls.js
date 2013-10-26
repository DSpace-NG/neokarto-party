var ProfileModal = require('./profileModal');
var CaptureModal = require('./captureModal');
var CommentModal = require('./commentModal');
var SupportModal = require('./support');
var AboutModal = require('./aboutModal');
var template = require('../../templates/controls.hbs');

var ControlsView = Backbone.View.extend({

  id: 'controls',

  events: {
    'click .comment': 'addComment',
    'touchstart .comment': 'addComment',
    'click .info': 'showInfo',
    'touchstart .info': 'showInfo',
    'click .settings': 'setProfile',
    'touchstart .settings': 'setProfile',
    'click .center': 'centerPlayer',
    'touchstart .center': 'centerPlayer',
    'click .camera': 'addCapture',
    'touchstart .camera': 'addCapture',
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
    this.askSupport();
  },

  addComment: function(){
    //new CommentModal({ player: this.options.player });
    this.askSupport();
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
