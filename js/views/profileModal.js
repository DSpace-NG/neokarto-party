var Modal = require('./modal');
var template = require('../../templates/profile.hbs');
var config = require('../../config');

var ProfileModal = Modal.extend({
  id: 'profile',
  template: template,
  ui: { close: true, submit: true },

  subEvents: {
    'touchstart .avatar': 'selectAvatar',
    'click .avatar': 'selectAvatar',
    'touchstart .team': 'selectTeam',
    'click .team': 'selectTeam'
  },

  initialize: function() {
    _.extend(this.events, this.subEvents);

    this.player = this.options.player;
    this.templateData = this.player.toJSON();
    this.templateData.avatars = config.avatars;
    this.templateData.teams = config.teams;
    this.selectedAvatar = this.player.get('avatar');
    this.render();
  },

  selectAvatar: function(event) {
    $('img.avatar').css("border", "2px solid black" );
    event.target.style.border = "2px solid red";
    this.selectedAvatar = event.target.attributes.data.value;
  },

  selectTeam: function(event) {
    $('img.team').css("border", "2px solid black" );
    event.target.style.border = "2px solid red";
    this.selectedTeam = event.target.attributes.data.value;
  },

  submit: function(event) {

    var nickname = this.$('input').val();

    // if empty nickname don't accept it
    if(nickname === "") return false;

    this.player.set({
      nickname: nickname,
      avatar: this.selectedAvatar,
      team: this.selectedTeam
    });

    this.close();
  }

});

module.exports = ProfileModal;
