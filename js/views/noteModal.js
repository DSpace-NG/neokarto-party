var NoteModal = Modal.extend({
  id: 'note',
  ui: { close: true, submit: true, focus: 'textarea' },

  initialize: function() {
    this.collection = this.options.user.notes;
    this.note = new Note();
    //console.log(this.note.toJSON());
    this.render();
  },

  submit: function(event) {
    this.mediaInput = this.$('input[name="media"]');
    this.textInput = this.$('textarea[name="text"]');

    this.note.set({
      text: this.textInput.val(),
      timeSubmit: new Date().getTime(),
      locationSubmit: this.options.user.currentLocation().toJSON()
    });

    var media = this.mediaInput[0].files[0];
    if(media) {
      this.note.attachFile(media);
    }
    if(this.note.get('text') || media) {
      this.collection.add(this.note);
    }

    this.close();
  }
});
