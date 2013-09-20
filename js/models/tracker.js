var BASE_URL = config.pubsub.url;
var FAYE_URL = BASE_URL + '/faye';
var FAYE_CHANNEL_PREFIX = '/bolzano/';

var Tracker = function(options) {
  _.bindAll(this, 'location', 'capture', 'profile');

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

  location: function(location) {
    var data = location.toJSON();
    data.user = this.user.get('id');
    data["@type"] = "location";
    console.log('TRACK location', data);
    this.faye.publish(this.channels.track, data);
  },

  // capture - an instance Backbone model Capture
  capture: function(capture) {
    var data = capture.toJSON();
    data.user = this.user.get('id');
    data["@type"] = "capture";
    console.log('TRACK capture', data);
    this.faye.publish(this.channels.story, data);
  },

  // user - an instance Backbone model User
  profile: function(user) {
    var data = user.toJSON();
    data["@type"] = "profile";
    console.log('TRACK profile', data);
    this.faye.publish(this.channels.profile, data);
  }
};
