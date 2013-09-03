var FAYE_URL = 'http://192.168.11.104:5000/faye';
var FAYE_CHANNEL_PREFIX = '/bolzano/'

var BigBrother = function(citizen) {
  _.bindAll(this, 'trackPoint', '_trackNote');
  this.faye = new Faye.Client(FAYE_URL);
  this.citizen = citizen;

  // hey you little fella!
  citizen.on('location-changed', this.trackPoint);
  citizen.notes.on('add', this._trackNote);

  this.channels = {
    track: FAYE_CHANNEL_PREFIX + 'track/' + citizen.id,
    notes: FAYE_CHANNEL_PREFIX + 'notes/' + citizen.id,
  };
};

BigBrother.prototype = {

  trackPoint: function(location) {
    console.log('publishing to ', this.channel);
    this.faye.publish(this.channels.track, location);
  },

  trackNote: function(note) {
    this.faye.publish(this.channels.notes, note);
  },

  _trackNote: function(note) {
    // ('note' is a Backbone.Model here)
    this.trackNote(note.attributes);
  },

  ignoreMessage: function() { /* ignored. */ }

};
