var BASE_URL = config.pubsub.url;
var FAYE_URL = BASE_URL + '/faye';
var FAYE_CHANNEL_PREFIX = '/bolzano/';

var Tracker = function(options) {
  _.bindAll(this, 'location', 'note', 'profile');

  this.faye = new Faye.Client(FAYE_URL);
  this.user = options.user;

  this.channels = {
    profile: FAYE_CHANNEL_PREFIX + 'profile/' + this.user.get('id'),
    track: FAYE_CHANNEL_PREFIX + 'track/' + this.user.get('id'),
    story: FAYE_CHANNEL_PREFIX + 'story/' + this.user.get('id')
  };

};

// FIXME: move to appropriate models/collections
Tracker.prototype = {

  // note - an instance Backbone model
  location: function(location) {
    var data = location.toJSON();
    data.user = this.user.get('id');
    data["@type"] = "location";
    console.log('TRACK POINT', [data.lat, data.lng]);
    this.faye.publish(this.channels.track, data);
  },

  // note - an instance Backbone model Note
  note: function(note) {
    var data = note.toJSON();
    data.user = this.user.get('id');
    data["@type"] = "note";
    console.log('TRACK note', [data.locationSubmit.lat, data.locationSubmit.lng], ':', data.text);
    this.faye.publish(this.channels.story, data);
  },

  // note - an instance Backbone model User
  profile: function(user) {
    var data = user.toJSON();
    data["@type"] = "profile";
    console.log('TRACK profile', data.nickname, ':', data.avatar, ':', data.color);
    this.faye.publish(this.channels.profile, data);
  }
};
