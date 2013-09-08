var Profile = Backbone.View.extend({
  el: '#profile',

  events: {
    'touchstart .submit': 'save',
    'click .submit': 'save',
    'touchstart .avatar': 'selectAvatar',
    'click .avatar': 'selectAvatar',
  },

  initialize: function() {
    this.el.style.display = 'block';
    this.user = this.options.user;
    if(this.$el.find('form').length === 0){
      var templateData = this.user.toJSON();
      templateData.avatars = this.user.avatars;
      console.log(templateData);
      this.$el.append(JST.profile(templateData));
    }
    this.input = this.$('input');
    this.input.focus();
  },

  selectAvatar: function(event) {
    $('img.avatar').css("border", "2px solid black" );
    event.target.style.border = "2px solid red";
    this.selectedAvatar = event.target.attributes.data.value;
  },

  save: function(event) {
    event.preventDefault();

    var nickname = this.input.val();
    var avatar = this.selectedAvatar;

    // if empty don't accept it
    if(nickname === "") return false;
    if(avatar === "") return false;

    this.user.set('nickname', nickname);
    this.user.set('avatar', avatar);
    this.el.style.display = 'none';
  }

});
