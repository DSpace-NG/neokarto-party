var Overlay = Backbone.View.extend({
  initialize: function(){
    this.layer = this.options.layer;

    _.bindAll(this, 'render');
    this.collection.on('add', this.render);
  }
});

var StoryOverlay = Overlay.extend({
  icon: L.icon({
    iconUrl: 'assets/images/markers/bubble.png',
    iconSize: [32, 32],
    iconAnchor: [9, 29]
  }),

  render: function(note) {
    var location = note.markerLocation();
    var marker = new L.Marker([location.lat, location.lng], {
      icon: this.icon
    });
    marker.bindPopup(new L.Popup().setContent('<em>'+note.attributes.text+'</em>'));
    this.layer.addLayer(marker);
  }
});

var TrackOverlay = Overlay.extend({

  initialize: function() {
    Overlay.prototype.initialize.call(this);
    this.track = new L.Polyline([], {
      color: this.options.color
    }).addTo(this.layer);
  },

  render: function(location) {
    this.track.addLatLng(location.toJSON());
  }
});

// FIXME: sometimes profile arrives first and sometiems fist location, simplyfy!
var AvatarOverlay = Overlay.extend({

  initialize: function() {
    Overlay.prototype.initialize.call(this);
    _.bindAll(this, 'updateAvatar');
    this.model.on('change', this.updateAvatar);
  },

  render: function(location) {
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
