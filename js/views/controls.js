var ControlsView = Backbone.View.extend({

  el: '#controls',

  events: {
    'click .add': 'addNote',
    'touchstart .add': 'addNote',
    'click .about': 'showAbout',
    'touchstart .about': 'showAbout',
    'click .settings': 'setProfile',
    'touchstart .settings': 'setProfile',
    'change .follow-me': 'updateFollowMe'
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
