var About = Backbone.View.extend({
  el: '#about',

  events: {
    'touchstart .close': 'close',
    'click .close': 'close'
  },

  initialize: function() {
    if(this.$el.find('h2').length === 0){
      this.$el.append(JST.about());
    }
    $('#about').show();
  },

  close: function() {
    this.el.style.display = 'none';
  },


});
