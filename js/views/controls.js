var ControlsView = Backbone.View.extend({

  id: 'controls',

  events: {
    'click .note': 'addNote',
    'touchstart .note': 'addNote',
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
    this.$el.append(JST.controls());
    $('body').append(this.el);
  },

  addNote: function() {
    new NoteModal({ user: this.options.user });
  },

  updateFollowMe: function(event) {
    this.options.user.set('followMe', event.target.checked);
  },

  setProfile: function() {
    new ProfileModal({ user: this.options.user });
  },

  showAbout: function() {
    new AboutModal();
  }

});
