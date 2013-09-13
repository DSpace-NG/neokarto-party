var Track = Backbone.Collection.extend({

  initialize: function() {
    _.bindAll(this, 'save');

    if(this.url) {
      this.storageKey = 'track-' + this.url;
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
