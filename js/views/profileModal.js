var Modal = require('./modal');
var template = require('../../templates/profile.hbs');

var ProfileModal = Modal.extend({
  id: 'profile',
  template: template,
  ui: { close: true, submit: true },

  subEvents: {
    'touchstart .avatar': 'selectAvatar',
    'click .avatar': 'selectAvatar',
  },

  initialize: function() {
    _.extend(this.events, this.subEvents);

    this.operator = this.options.operator;
    this.templateData = this.operator.toJSON();
    this.templateData.avatars = this.avatars;
    this.selectedAvatar = this.operator.get('avatar');
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

    this.operator.set({
      nickname: nickname,
      avatar: avatar
    });

    this.close();
  },

  // create list of avatar objects
  avatars: [
    { file: 'afro' },
    { file: 'alien' },
    { file: 'anciano' },
    { file: 'artista' },
    { file: 'astronauta' },
    { file: 'barbaman' },
    { file: 'bombero' },
    { file: 'boxeador' },
    { file: 'bruce_lee' },
    { file: 'caradebolsa' },
    { file: 'chavo' },
    { file: 'cientifica' },
    { file: 'cientifico_loco' },
    { file: 'comisario' },
    { file: 'cupido' },
    { file: 'diabla' },
    { file: 'director' },
    { file: 'dreds' },
    { file: 'elsanto' },
    { file: 'elvis' },
    { file: 'emo' },
    { file: 'escafandra' },
    { file: 'estilista' },
    { file: 'extraterrestre' },
    { file: 'fisicoculturista' },
    { file: 'funky' },
    { file: 'futbolista_brasilero' },
    { file: 'gay' },
    { file: 'geisha' },
    { file: 'ghostbuster' },
    { file: 'glamrock_singer' },
    { file: 'guerrero_chino' },
    { file: 'hiphopper' },
    { file: 'hombre_hippie' },
    { file: 'hotdog_man' },
    { file: 'indio' },
    { file: 'joker' },
    { file: 'karateka' },
    { file: 'mago' },
    { file: 'maori' },
    { file: 'mario_barakus' },
    { file: 'mascara_antigua' },
    { file: 'metalero' },
    { file: 'meteoro' },
    { file: 'mimo' },
    { file: 'mister' },
    { file: 'mounstrico1' },
    { file: 'mounstrico2' },
    { file: 'mounstrico4' },
    { file: 'mounstruo' },
    { file: 'muerte' },
    { file: 'mujer_hippie' },
    { file: 'mujer_latina' },
    { file: 'muneco_lego' },
    { file: 'nena_afro' }
  ],

});

module.exports = ProfileModal;
