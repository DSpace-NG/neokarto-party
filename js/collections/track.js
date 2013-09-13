var Track = Backbone.Collection.extend({

  initialize: function() {
    _.bindAll(this, 'save');

    if(localStorage.track){
      this.set(JSON.parse(localStorage.track));
    }
    this.on('add', this.save);
  },

  save: function() {
    window.foo = this;
    localStorage.track = JSON.stringify(this);
  }
});
