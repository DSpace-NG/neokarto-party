var ControlsView = Backbone.View.extend({

  el: '#controls',

  events: {
    'click .add': 'addNote',
    'touchstart .add': 'addNote',
    'click .about': 'showAbout',
    'touchstart .about': 'showAbout',
    'change .follow-me': 'updateFollowMe'
  },

  addNote: function() {
    new NoteInputView(this.options);
  },

  updateFollowMe: function(event) {
    this.options.user.set('followMe', event.target.checked);
  },

  showAbout: function() {
    new About();
  }

});
