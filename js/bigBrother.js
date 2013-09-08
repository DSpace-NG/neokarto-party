var BASE_URL = 'http://localhost:5001';
var FAYE_URL = BASE_URL + '/faye';
var AUTH_URL = BASE_URL + '/auth';
var FAYE_CHANNEL_PREFIX = '/bolzano/';

var BigBrother = function(citizen) {
  _.bindAll(this, 'trackPoint', '_trackNote');
  this.faye = new Faye.Client(FAYE_URL);
  this.citizen = citizen;

  this.channels = {
    track: FAYE_CHANNEL_PREFIX + 'track/' + citizen.id,
    notes: FAYE_CHANNEL_PREFIX + 'notes/' + citizen.id,
  };

  this.faye.addExtension({
    outgoing: function(message, callback) {
      if(! message.ext) message.ext = {};
      message.ext.token = citizen.token;
      callback(message);
    }
  });

  // hey you little fella!
  citizen.on('location-changed', this.trackPoint);
  citizen.notes.on('add', this._trackNote);
};

BigBrother.auth = function(credentials, callback) {
  console.log('auth', credentials);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', AUTH_URL, true);
  xhr.onload = function() {
    if(xhr.status == 200) {
      callback(null, JSON.parse(xhr.responseText));
    } else {
      callback(xhr.responseText);
    }
  };
  xhr.onerror = function(event) {
    console.log('req failed', event);
  };
  xhr.send();
};

BigBrother.acquireId = function(callback) {
  this.auth({}, function(error, result) {
    if(error) callback(error);
    else callback(null, result.id, result.token);
  });
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
