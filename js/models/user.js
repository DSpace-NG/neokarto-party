
var User = Backbone.Model.extend({

  initialize: function() {
    _.bindAll(this, 'setLocation', '_acquiredId');

    // deal with nickname
    if(localStorage['neokarto:user:nickname']){
      this.attributes.nickname = localStorage['neokarto:user:nickname'];
    } else {
      this.promptNickname();
    }
    this.on('change:nickname', function(){
      localStorage['neokarto:user:nickname'] = this.get('nickname');
    });

    // deal with id and token
    if(localStorage['neokarto:user:id'] && localStorage['neokarto:user:token']) {
      this.id = localStorage['neokarto:user:id'];
      this.token = localStorage['neokarto:user:token'];
      setTimeout(this.trigger.bind(this), 0, 'id-assigned');
    } else {
      BigBrother.acquireId(this._acquiredId);
    }

    // initiate track and notes
    this.notes = new NotesCollection();
    this.track = new TrackCollection();
  },

  // creates modal asking for nickname and setting it on this model
  promptNickname: function() {
    new Profile( {user: this} );
  },

  setLocation: function(location) {
    if(this.location && this.location.lat == location.latlng.lat && this.location.lng == location.latlng.lng) {
      // location didn't actually change.
      return;
    }
    this.location = location.latlng;
    this.location.accuracy = location.accuracy;
    this.trigger('location-changed', this.location);
  },

  _acquiredId: function(error, id, token) {
    if(error) {
      console.error("Failed to acquire ID: ", error);
    } else {
      this.id = id;
      this.token = token;
      localStorage['neokarto:user:id'] = id;
      localStorage['neokarto:user:token'] = token;
      this.trigger('id-assigned');
    }
  },

  on: function(eventName, handler) {
    if(eventName == 'location-changed' && this.location) {
      handler(this.location);
    }
    return Backbone.Model.prototype.on.call(this, eventName, handler);
  }

});


// a user from the HQ perspective.
// FIXME: clean up the user above and make this the same.
var WatchedUser = Backbone.Model.extend({
  initialize: function() {
    this.notes = new NotesCollection();
    this.track = new TrackCollection();
  }
});

