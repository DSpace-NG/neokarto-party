var template = require('../../templates/actions.hbs');

var ActionsView = Backbone.View.extend({

  id: 'actions',

  events: {
  },

  initialize: function(){
    this.render();
  },

  render: function(){
    this.$el.append(template());
    this.hide();
    $('body').append(this.el);
  },

  hide: function(){
    this.$el.hide();
  },

  show: function(){
    this.$el.show();
  }

});

module.exports = ActionsView;
