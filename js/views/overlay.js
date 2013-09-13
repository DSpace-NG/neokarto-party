var StoryOverlay = Backbone.View.extend({
  icon: L.icon({
    iconUrl: 'assets/images/markers/bubble.png',
    iconSize: [32, 32],
    iconAnchor: [9, 29]
  }),

  initialize: function() {
    this.layer = this.options.layer;
    _.bindAll(this, 'add');
    this.collection.on('add', this.add);

    if(this.collection.length > 0) {
      this.collection.each(function(location){
        this.add(location);
      }, this);
    }
  },

  add: function(note) {
    var location = note.markerLocation();
    if(location) {
      var marker = new L.Marker([location.lat, location.lng], {
        icon: this.icon
      });
      marker.bindPopup(new L.Popup().setContent('<em>'+note.attributes.text+'</em>'));
      this.layer.addLayer(marker);
    }
  }
});

var TrackOverlay = Backbone.View.extend({

  initialize: function() {
    this.layer = this.options.layer;
    _.bindAll(this, 'add');
    this.collection.on('add', this.add);

    this.track = new L.Polyline([], {
      color: this.options.color
    }).addTo(this.layer);

    if(this.collection.length > 0) {
      this.collection.each(function(location){
        this.add(location);
      }, this);
    }
  },

  add: function(location) {
    this.track.addLatLng(location.toJSON());
  }
});

// FIXME: sometimes profile arrives first and sometiems fist location, simplyfy!
var AvatarOverlay = Backbone.View.extend({

  initialize: function() {
    this.layer = this.options.layer;
    _.bindAll(this, 'add', 'updateAvatar');
    this.collection.on('add', this.add);

    this.model.on('change', this.updateAvatar);
  },

  add: function(location) {
    if(this.avatar) {
      this.avatar.setLatLng(location.toJSON());
    } else {
      this.avatar = new L.Marker(location.toJSON()).
        addTo(this.layer);
      if(this.initialIcon) {
      this.avatar.setIcon(this.initialIcon);
      }
    }
  },

  updateAvatar: function(user) {
    if(this.avatar){
      this.avatar.setIcon(user.getAvatarIcon());
    } else {
      this.initialIcon = user.getAvatarIcon();
    }
  }
});
