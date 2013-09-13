var Story = Backbone.Collection.extend({
  model: Note,

  initialize: function() {
    _.bindAll(this, 'save');

    // for now faking url to pass user's uuid
    if(this.url) {
      this.storageKey = 'story-' + this.url;
      if(localStorage[this.storageKey]){
        this.set(JSON.parse(localStorage[this.storageKey]));
      }
      this.on('add', this.save);
    }
  },

  save: function() {
    localStorage[this.storageKey] = JSON.stringify(this.toJSON());
  }
});
