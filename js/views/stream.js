var Stream = Backbone.View.extend({
  el: "#stream",

  initialize: function() {
    _.bindAll(this, 'addMedia');
    this.collection.on('add', this.addMedia);
  },

  addMedia: function(note){
    var html = '<img src="' + config.media.url + note.get('uuid') + '" />';
    setTimeout(function() {
      this.$el.append(html);
    }.bind(this), 30000);
  }

});
