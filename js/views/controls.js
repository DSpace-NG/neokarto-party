var ControlsView = Backbone.View.extend({

  el: '#controls',

  events: {
    'click .add': 'addNote',
    'touchstart .add': 'addNote',
    'change .follow-me': 'updateFollowMe'
  },

  addNote: function() {
    $('#note-input')[0].style.display = 'block';
  },

  updateFollowMe: function(event) {
    this.options.user.set('followMe', event.target.checked);
  }

});
