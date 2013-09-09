var AboutModal = Backbone.View.extend({
  id: 'about',
  className: 'modal',

  events: {
    'touchstart .close': 'close',
    'click .close': 'close'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.append(JST.about());
    $('body').append(this.el);
  },

  close: function() {
    this.remove();
  },

});
