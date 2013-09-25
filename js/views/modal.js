var Modal = Backbone.View.extend({
  className: 'modal',

  events: {
    'touchstart .close': 'close',
    'click .close': 'close',
    'touchstart .submit': 'submit',
    'click .submit': 'submit',
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    if(this.ui.close) {
      this.$el.append('<button class="close icon-cancel"></button>');
    }

    if(this.ui.submit) {
      this.$el.append('<button class="submit icon-ok"></button>');
    }

    this.$el.append(this.template(this.templateData));

    $('body').append(this.el);

    if(this.ui.focus) {
      this.$(this.ui.focus).focus();
    }
  },

  close: function() {
    this.remove();
  },

});

module.exports = Modal;
