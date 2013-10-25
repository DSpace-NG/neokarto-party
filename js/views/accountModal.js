var Modal = require('./modal');
var template = require('../../templates/account.hbs');
var config = require('../../config');

var AccountModal = Modal.extend({
  id: 'account',
  template: template,
  ui: { submit: true },

  subEvents: {
    'touchstart input': 'selectHost',
    'click input': 'selectHost'
  },

  initialize: function() {
    _.extend(this.events, this.subEvents);

    this.player = this.options.player;
    this.templateData = { hosts: config.hosts };
    this.render();
  },

  selectHost: function(event){
    if(event.target.type != 'radio') return false;
    this.domain = event.target.value;
    this.host = config.hosts[this.domain];
  },

  submit: function(event) {

    var login = this.$('input[type=text]').val();

    // if empty nickname don't accept it
    if(!login || !this.host) return false;

    this.player.set({
      acct: login + '@' + this.domain ,
      track: {
        feed: {
          url: this.host.channels.history,
          path: '/' + this.player.get('uuid') + '/track'
        },
        channel: {
          url: this.host.channels.live,
          path: '/' + this.player.get('uuid') + '/track'
        }
      }
    });

    this.close();
  }

});

module.exports = AccountModal;
