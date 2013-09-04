var NoteInputView = Backbone.View.extend({
  el: '#note-input',

  events: {
    'submit form': 'save',
    'click .close': 'close',
    'touchstart .close': 'close'
  },

  initialize: function() {
    _.bindAll(this, 'close');
    this.bg = $('#note-background');
    this.bg.css({ display: 'block' });
    this.bg.on('click', this.close);
    this.$el.fadeIn();
    this.pictureInput = this.$('input[name="picture"]');
    this.textInput = this.$('textarea[name="text"]');
    this.collection = this.options.user.notes;
    this.textInput.focus();
  },

  save: function(event) {
    event.preventDefault();
    var note = {
      text: this.textInput.val(),
      time: new Date().getTime(),
      location: this.options.user.location
    };
    var picture = this.pictureInput[0].files[0];
    if(picture) {
      var reader = new FileReader();
      reader.onload = function() {
        note.picture = btoa(reader.result);
        this._save(note);
      }.bind(this);
      reader.readAsBinaryString(picture);
    } else {
      this._save(note);
    }
    return false;
  },

  _save: function(note) {
    this.collection.add(note);
    this._reset();
    this.close();
  },

  close: function() {
    this.$el.fadeOut();
    this.bg.css({ display: 'none' });
    this.bg.off('click', this.close);
  },

  _reset: function() {
    this.textInput.val('');
  }

});
