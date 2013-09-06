var Profile = Backbone.View.extend({
  el: '#profile',

  events: {
    'touchstart .submit': 'save',
    'click .submit': 'save',
  },

  initialize: function() {
    this.el.style.display = 'block';
    if(this.$el.find('form').length === 0){
      this.$el.append(JST.profile());
    }
    this.input = this.$('input');
    this.user = this.options.user;
    this.input.focus();
  },

  save: function(event) {
    event.preventDefault();

    var nickname = this.input.val();

    // if empty don't accept it
    if(nickname === "") return false;

    this.user.set('nickname', nickname);
    this.el.style.display = 'none';
  }

});
