var PixelIcon = L.Icon.extend({
  options: {
    iconSize:     [48, 48],
    iconAnchor:   [24, 48],
    popupAnchor:  [-3, -76]
  }
});

var User = Backbone.Model.extend({

  initialize: function() {
    _.bindAll(this, 'setLocation');

    // deal with nickname
    if(localStorage['neokarto:user:nickname']){
      this.attributes.nickname = localStorage['neokarto:user:nickname'];
    } else {
      this.promptProfile();
    }

    // checks localstorage for avatars, if not existing sets it to default
    if(localStorage['neokarto:user:avatar']){
      this.attributes.avatar = localStorage['neokarto:user:avatar'];
    }else{
      this.attributes.avatar = 'desert';
    }
    
    // updates user settings
    this.on('change:nickname', function(){
      localStorage['neokarto:user:nickname'] = this.get('nickname');
    });
    this.on('change:avatar', function(){
      localStorage['neokarto:user:avatar'] = this.get('avatar');
      this.marker.setIcon(this.getAvatarIcon());
    });

    // deal with id
    if(localStorage['neokarto:user:id']) {
      this.id = localStorage['neokarto:user:id'];
    } else {
      this.id = Math.random() * 10000000000000000; //FIXME use UUID
    }

    // initiate track and notes
    this.notes = new NotesCollection();
    this.track = new TrackCollection();
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
    {file:'forest', name:'Forest'},
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
    // FIXME: acquire email address and display avatar instead?
    var iconUrl = 'assets/images/avatars/'+this.get('avatar')+'.png';
    return new PixelIcon({iconUrl: iconUrl});
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

