var config = require('../../config');
var Modal = require('./modal');
var Action = require('dspace-api-core/models/action');
var template = require('../../templates/capture.hbs');

var ActionModal = Modal.extend({
  id: 'capture',
  template: template,
  ui: { close: true, submit: true, focus: 'textarea' },

  initialize: function() {
    this.collection = this.options.user.story;
    this.capture = new Action();
    //console.log(this.capture.toJSON());
    this.render();
  },

  submit: function(event) {
    this.mediaInput = this.$('input[name="media"]');
    this.textInput = this.$('textarea[name="text"]');

    this.capture.set({
      text: this.textInput.val(),
      timeSubmit: new Date().getTime(),
      locationSubmit: this.options.user.currentLocation().toJSON()
    });

    var media = this.mediaInput[0].files[0];
    if(media) {
      this.capture.attachFile(config.media.url, media);
    }
    if(this.capture.get('text') || media) {
      this.collection.add(this.capture);
    }

    this.close();
  }
});

module.exports = ActionModal;
