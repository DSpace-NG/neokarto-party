var User = Backbone.Model.extend({

  idAttribute: 'uuid',

  initialize: function() {
    _.bindAll(this, 'setProfile', 'updateLocation');
    this.set('@type', 'profile', { silent: true });

    if(localStorage.uuid) {
      this.set("uuid", localStorage.uuid, {silent: true});
    } else {
      this.set("uuid", uuid(), {silent: true});
      localStorage.uuid = this.get('uuid');
    }

    this.profileKey = 'profile-' + this.get('uuid');

    if(localStorage[this.profileKey]) {
      this.set(JSON.parse(localStorage[this.profileKey]));
    }

    // initiate track and story
    this.story = new Story([], { url: this.get('uuid') });
    this.story.fetch();

    this.track = new Track([], { url: this.get('uuid') });
    this.track.fetch();

    this.tracker = new Tracker({ user: this });
    this.on('change', this.tracker.profile);
    this.track.on('add', this.tracker.location);
    this.story.on('add', this.tracker.capture);
  },

  setProfile: function(attributes) {
    this.set(attributes);
    localStorage[this.profileKey] = JSON.stringify(this.toJSON());
  },

  currentLocation: function() {
    return this.track.at(this.track.length - 1);
  },

  updateLocation: function(mapLocation) {
    var location = { lat: mapLocation.latlng.lat, lng: mapLocation.latlng.lng };
    var current = this.currentLocation();
    if(current &&
       current.get('lat') == location.lat &&
       current.get('lng') == location.lng) {
      return; // location didn't actually change.
    }
    this.track.add(location);
    this.trigger('location', this.currentLocation());
  },

});


// a user from the HQ perspective.
// FIXME: clean up the user above and make this the same.
var WatchedUser = Backbone.Model.extend({

  idAttribute: 'uuid',

  initialize: function() {
    _.bindAll(this, 'updateProfile');

    // move layerGroup out of attributes
    this.layerGroup = this.get('layerGroup');
    this.unset('layerGroup');


    this.profileKey = 'profile-' + this.get('uuid');

    if(localStorage[this.profileKey]) {
      this.set(JSON.parse(localStorage[this.profileKey]));
    }

    this.story = new Story([], { url: this.uuid });
    this.story.fetch();
    this.track = new Track([], { url: this.uuid });
    this.track.fetch();


    this.storyOverlay = new StoryOverlay({
      collection: this.story,
      layer: this.layerGroup
    });
    this.trackOverlay = new TrackOverlay({
      collection: this.track,
      color: this.get('color'),
      layer: this.layerGroup
    });
    this.avatarOverlay = new AvatarOverlay({
      model: this,
      collection: this.track,
      layer: this.layerGroup
    });

    this.on('change', this.updateProfile);
  },

  // FIXME: duplicated from User!
  getAvatarIcon: function() {
    var iconUrl = 'assets/images/avatars/'+ this.get('avatar') + '.png';
    return new PixelIcon({iconUrl: iconUrl});
  },

  // FIXME: duplicated from User!
  currentLocation: function() {
    return this.track.at(this.track.length - 1);
  },

  // FIXME: move to overlays
  updateProfile: function() {
    localStorage[this.profileKey] = JSON.stringify(this.toJSON());
    this.avatarOverlay.updateAvatar(this);
    this.trackOverlay.track.setStyle({color: this.get('color')});
  }
});

