var PixelIcon = L.Icon.extend({
  options: {
    iconSize:     [48, 48],
    iconAnchor:   [24, 48],
    popupAnchor:  [-3, -76]
  }
});

var User = Backbone.Model.extend({

  initialize: function() {
    _.bindAll(this, 'setProfile', 'updateLocation');

    // move layerGroup out of attributes
    this.layerGroup = this.get('layerGroup');
    this.unset('layerGroup');

    if(localStorage.id) {
      this.set("id", localStorage.id, {silent: true});
    } else {
      this.set("id", uuid(), {silent: true});
      localStorage.id = this.get('id');
    }

    this.profileKey = 'profile-' + this.get('id');

    if(localStorage[this.profileKey]) {
      this.set(JSON.parse(localStorage[this.profileKey]));
    } else {
      this.set({
        "@type": 'profile',
        color: this._randomColor(), // FIXME allow setting from ui
        avatar: 'desert'// FIXME no magic values inline please ;)
      });
      this.promptProfile();
    }

    // FIXME tmp way of clearing localStorage from UI #hack
    this.on('change:nickname', function(){
      if(this.get('nickname') === 'RESET'){
        this.reset();
        alert('RESET: localStorage cleared!');
        return;
      }
    });

    // initiate track and story
    this.story = new Story([], { url: this.id });
    this.track = new Track([], { url: this.id });

    this.tracker = new Tracker({ user: this });

    this.on('change', this.tracker.profile);
    this.track.on('add', this.tracker.location);
    this.story.on('add', this.tracker.note);

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
  },

  setProfile: function(attributes) {
    this.set(attributes);
    localStorage[this.profileKey] = JSON.stringify(this.toJSON());
  },

  // creates modal asking for nickname and setting it on this model
  promptProfile: function() {
    new ProfileModal( {user: this} );
  },

  // create list of avatar objects
  avatars: [
    {file:'agent', name:'Agent'},
    {file:'boss', name:'Skeleton Boss'},
    {file:'clotharmor', name:'Cloth Armor'}, 
    {file:'coder', name:'Coder'},
    {file:'deathknight', name:'Deatch Knight'}, 
    {file:'desert', name:'Desert'},
    {file:'firefox', name:'Firefox'}, 
    {file:'ghost', name:'Ghost'},
    {file:'goldenarmor', name:'Golden Armor'}, 
    {file:'guard', name:'HTML5 Guard'}, 
    {file:'king', name:'King'},
    {file:'ninja', name:'Ninja'},
    {file:'priest', name:'Priest'}, 
    {file:'scientist', name:'Scientist'}, 
    {file:'skeleton', name:'Skeleton'}, 
    {file:'villager', name:'Villager'},
    {file:'zombie', name:'Zombie'}
  ],

  getAvatarIcon: function() {
    var iconUrl = 'assets/images/avatars/'+ this.get('avatar') + '.png';
    return new PixelIcon({iconUrl: iconUrl});
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
  },

  // clear local storage expecting 'RESET' nickname
  reset: function() {
    localStorage.clear();
    location.reload();
  },

  // gnerates random hex color string for css
  // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
  _randomColor: function() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
});


// a user from the HQ perspective.
// FIXME: clean up the user above and make this the same.
var WatchedUser = Backbone.Model.extend({

  initialize: function() {
    _.bindAll(this, 'updateProfile');

    // move layerGroup out of attributes
    this.layerGroup = this.get('layerGroup');
    this.unset('layerGroup');


    this.profileKey = 'profile-' + this.get('id');

    if(localStorage[this.profileKey]) {
      this.set(JSON.parse(localStorage[this.profileKey]));
    }

    this.layerControl = this.attributes.layerControl;

    this.story = new Story([], { url: this.id });
    this.track = new Track([], { url: this.id });

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

