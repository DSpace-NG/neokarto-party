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

  add: function(capture) {
    var location = capture.markerLocation();
    if(location) {
      var marker = new L.Marker([location.lat, location.lng], {
        icon: this.icon
      });
      marker.bindPopup(new L.Popup().setContent('<em>'+capture.attributes.text+'</em>'));
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
var PixelIcon = L.Icon.extend({
  options: {
    iconSize:     [48, 48],
    iconAnchor:   [24, 48],
    popupAnchor:  [-3, -76]
  }
});

var AvatarOverlay = Backbone.View.extend({

  initialize: function() {
    this.layer = this.options.layer;
    _.bindAll(this, 'move', 'update');

    this.model.on('location', this.move);
    this.model.on('change', this.update);
  },

  getAvatarIcon: function() {
    var iconUrl = 'assets/images/avatars/'+ this.model.get('avatar') + '.png';
    return new PixelIcon({iconUrl: iconUrl});
  },

  move: function(location) {
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

  update: function(user) {
    if(this.avatar){
      this.avatar.setIcon(this.getAvatarIcon());
    } else {
      this.initialIcon = this.getAvatarIcon();
    }
  }
});
