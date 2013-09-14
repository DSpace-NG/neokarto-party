var Story = Backbone.Collection.extend({
  model: Note,

  initialize: function() {
    _.bindAll(this, 'save');
    this.on('add', this.save);

    // for now faking url to pass user's uuid
    if(this.url) {
      this.storageKey = 'story-' + this.url;
    } else {
      this.storageKey = 'media';
    }
  },

  fetch: function() {
    if(localStorage[this.storageKey]){
      this.reset(JSON.parse(localStorage[this.storageKey]));
    }
  },

  save: function() {
    localStorage[this.storageKey] = JSON.stringify(this.toJSON());
  }
});
