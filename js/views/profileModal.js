var ProfileModal = Modal.extend({
  id: 'profile',
  ui: { close: true, submit: true },

  subEvents: {
    'touchstart .avatar': 'selectAvatar',
    'click .avatar': 'selectAvatar',
  },

  initialize: function() {
    _.extend(this.events, this.subEvents);

    this.user = this.options.user;
    this.templateData = this.user.toJSON();
    this.templateData.avatars = this.user.avatars;
    this.selectedAvatar = this.user.get('avatar');
    this.render();
  },

  selectAvatar: function(event) {
    $('img.avatar').css("border", "2px solid black" );
    event.target.style.border = "2px solid red";
    this.selectedAvatar = event.target.attributes.data.value;
  },

  submit: function(event) {
    var nickname = this.$('input').val();
    var avatar = this.selectedAvatar;

    // if empty nickname don't accept it
    if(nickname === "") return false;

    this.user.setProfile({
      nickname: nickname,
      avatar: avatar
    });

    this.close();
  }

});
