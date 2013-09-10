var PixelIcon = L.Icon.extend({
  options: {
    iconSize:     [48, 48],
    iconAnchor:   [24, 48],
    popupAnchor:  [-3, -76]
  }
});

var User = Backbone.Model.extend({

  initialize: function() {
    _.bindAll(this, 'updateLocation');

    // deal with id
    if(localStorage['neokarto:user:id']) {
      this.id = localStorage['neokarto:user:id'];
    } else {
      this.id = Math.random() * 10000000000000000; //FIXME use UUID
      localStorage['neokarto:user:id'] = this.id;
    }


    // deal with nickname
    if(localStorage['neokarto:user:nickname']){
      this.attributes.nickname = localStorage['neokarto:user:nickname'];
    } else {
      this.promptProfile();
    }

    this.on('change:nickname', function(){
      localStorage['neokarto:user:nickname'] = this.get('nickname');
    });


    // checks localstorage for avatars, if not existing sets it to default
    if(localStorage['neokarto:user:avatar']){
      this.attributes.avatar = localStorage['neokarto:user:avatar'];
    }else{
      this.attributes.avatar = 'desert'; // FIXME no magic values inline please ;)
    }

    this.on('change:avatar', function(){
      localStorage['neokarto:user:avatar'] = this.get('avatar');
      this.marker.setIcon(this.getAvatarIcon());
    });


    // set color
    if(localStorage['neokarto:user:color']){
      this.attributes.color = localStorage['neokarto:user:color'];
    }else{
      this.attributes.color = this._randomColor(); // FIXME allow setting from ui
      localStorage['neokarto:user:color'] = this.attributes.color;
    }


    // initiate track and notes
    this.notes = new NotesCollection();
    this.track = new TrackCollection();


    // setup tracker and send initial profile
    this.tracker = new Tracker({ user: this });
    this.tracker.profile(this);

    this.on('change', this.tracker.profile);
    this.track.on('add', this.tracker.location);
    this.notes.on('add', this.tracker.note);
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

    this.map = this.attributes.map;
    this.layerControl = this.attributes.layerControl;

    this.layerGroup = new L.LayerGroup();
    this.layerControl.addOverlay(this.layerGroup, this.id);

    this.notes = new NotesCollection();
    this.track = new TrackCollection();

    this.notesOverlay = new NotesOverlay({
      map: this.map,
      collection: this.notes
    });
    this.trackOverlay = new TrackOverlay({
      map: this.map,
      collection: this.track,
      color: this.get('color')
    });
    window.foo = this.trackOverlay;

    this.on('change', this.updateProfile);
  },

  // FIXME: duplicated from User!
  getAvatarIcon: function() {
    var iconUrl = 'assets/images/avatars/'+ this.get('avatar') + '.png';
    return new PixelIcon({iconUrl: iconUrl});
  },

  // FIXME: what a mess i made :( !!!
  updateProfile: function() {
    this.trackOverlay.marker.setIcon(this.getAvatarIcon());
    var label = '<img src="assets/images/avatars/' + this.get('avatar')  + '.png" /><em style="border-color:' + this.get('color') + '">' + this.get('nickname') + '</em>';
    this.layerControl.addOverlay(this.layerGroup, label);
    this.trackOverlay.track.setStyle({color: this.get('color')});
  }
});

