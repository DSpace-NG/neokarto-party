var BASE_URL = config.pubsub.url;
var FAYE_URL = BASE_URL + '/faye';
var FAYE_CHANNEL_PREFIX = '/bolzano/';

var BigBrother = function(citizen) {
  _.bindAll(this, 'trackPoint', '_trackNote');
  this.faye = new Faye.Client(FAYE_URL);
  this.citizen = citizen;

  this.channels = {
    track: FAYE_CHANNEL_PREFIX + 'track/' + citizen.id,
    notes: FAYE_CHANNEL_PREFIX + 'notes/' + citizen.id,
  };

  // hey you little fella!
  citizen.on('location-changed', this.trackPoint);
  citizen.notes.on('add', this._trackNote);
};

BigBrother.prototype = {

  trackPoint: function(location) {
    console.log('TRACK POINT', [location.lat, location.lng]);
    this.faye.publish(this.channels.track, location);
  },

  trackNote: function(note) {
    console.log('TRACK NOTE', [note.location.lat, note.location.lng], ':', note.text);
    this.faye.publish(this.channels.notes, note);
  },

  _trackNote: function(note) {
    // ('note' is a Backbone.Model here)
    this.trackNote(note.attributes);
  }

};
