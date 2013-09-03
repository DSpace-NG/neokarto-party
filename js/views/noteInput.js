var NoteInputView = Backbone.View.extend({
  el: '#note-input',

  events: {
    'submit form': 'save'
  },

  save: function(event) {
    event.preventDefault();
    console.log('TODO: save note', event.target.text.value);
  }

});
