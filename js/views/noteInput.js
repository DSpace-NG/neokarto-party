var NoteInputView = Backbone.View.extend({
  el: '#note-input',

  events: {
    'touchstart .submit': 'save',
    'click .submit': 'save',
    'touchstart .close': 'close',
    'click .close': 'close'
  },

  initialize: function() {
    this.el.style.display = 'block';
    if(this.$el.find('form').length === 0){
      this.$el.append(JST.noteInput());
    }
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
    } else if(note.text) {
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
    this.el.style.display = 'none';
  },

  _reset: function() {
    this.textInput.val('');
  }

});
