var NoteInputView = Backbone.View.extend({
  el: '#note-input',

  events: {
    'submit form': 'save',
    'click .close': 'close',
    'touchstart .close': 'close'
  },

  initialize: function() {
    this.el.style.display = 'block';
    this.textInput = this.$('textarea[name="text"]');
    this.collection = this.options.user.notes;
    this.textInput.focus();
  },

  save: function(event) {
    event.preventDefault();
    this.collection.add({
      text: this.textInput.val(),
      time: new Date().getTime(),
      location: this.options.user.location
    });
    this._reset();
    this.close();
    return false;
  },

  close: function() {
    this.el.style.display = 'none';
  },

  _reset: function() {
    this.textInput.val('');
  }

});
