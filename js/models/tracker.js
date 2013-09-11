var BASE_URL = config.pubsub.url;
var FAYE_URL = BASE_URL + '/faye';
var FAYE_CHANNEL_PREFIX = '/bolzano/';

var Tracker = function(options) {
  _.bindAll(this, 'location', 'note', 'profile');

  this.faye = new Faye.Client(FAYE_URL);
  var citizen = options.user;

  this.channels = {
    profile: FAYE_CHANNEL_PREFIX + 'profile/' + citizen.id,
    track: FAYE_CHANNEL_PREFIX + 'track/' + citizen.id,
    notes: FAYE_CHANNEL_PREFIX + 'notes/' + citizen.id
  };

};

Tracker.prototype = {

  // note - an instance Backbone model
  location: function(location) {
    var data = location.toJSON();
    console.log('TRACK POINT', [data.lat, data.lng]);
    this.faye.publish(this.channels.track, data);
  },

  // note - an instance Backbone model Note
  note: function(note) {
    var data = note.toJSON();
    console.log('TRACK data', [data.locationSubmit.lat, data.locationSubmit.lng], ':', data.text);
    this.faye.publish(this.channels.notes, data);
  },

  // note - an instance Backbone model User
  profile: function(user) {
    var data = user.toJSON();
    console.log('TRACK profile', data.nickname, ':', data.avatar, ':', data.color);
    this.faye.publish(this.channels.profile, data);
  }
};
