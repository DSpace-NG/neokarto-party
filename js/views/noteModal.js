var NoteModal = Modal.extend({
  id: 'note',
  ui: { close: true, submit: true, focus: 'textarea' },

  initialize: function() {
    this.collection = this.options.user.notes;
    this.render();
  },

  submit: function(event) {
    this.pictureInput = this.$('input[name="picture"]');
    this.textInput = this.$('textarea[name="text"]');

    var note = {
      text: this.textInput.val(),
      time: new Date().getTime(),
      location: this.options.user.currentLocation().toJSON()
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

    this.close();
  },

  _save: function(note){
    this.collection.add(note);
  }

});
