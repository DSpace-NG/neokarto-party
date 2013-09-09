var Modal = Backbone.View.extend({
  className: 'modal',

  events: {
    'touchstart .close': 'close',
    'click .close': 'close'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    if(this.ui.close) {
      this.$el.append('<button class="close icon-cancel"></button>');
    }
    this.$el.append(JST[this.id]());
    $('body').append(this.el);
  },

  close: function() {
    this.remove();
  },

});
