var SupportModal = require('./support');
var template = require('../../templates/actions.hbs');

var ActionsView = Backbone.View.extend({

  id: 'actions',

  events: {
    'click .profile': 'askSupport',
    'touchstart .profile': 'askSupport',
    'click .comment': 'askSupport',
    'touchstart .comment': 'askSupport',
    'click .camera': 'askSupport',
    'touchstart .camera': 'askSupport',
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
  },

  askSupport: function() {
    new SupportModal();
  }
});

module.exports = ActionsView;
