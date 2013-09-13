var Story = Backbone.Collection.extend({
  model: Note,

  initialize: function() {
    _.bindAll(this, 'save');

    if(localStorage.story){
      this.set(JSON.parse(localStorage.story));
    }
    this.on('add', this.save);
  },

  save: function() {
    localStorage.story = JSON.stringify(this.toJSON());
  }
});
