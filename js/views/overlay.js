var Overlay = Backbone.View.extend({
  initialize: function(){
    this.layer = this.options.layer;

    _.bindAll(this, 'render');

    if(this.collection) {
      this.collection.on('add', this.render);
    } else if(this.model) {
      this.model.on('change', this.render);
    }
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

var AvatarOverlay = Overlay.extend({

  initialize: function() {
    Overlay.prototype.initialize.call(this);
    _.bindAll(this, 'move');
    this.model.track.on('add', this.move);
  },

  render: function(user) {
    var location = user.currentLocation().toJSON();
    if(this.marker) {
      user.avatarOverlay.marker.setIcon(user.getAvatarIcon());
    } else {
      this.marker = new L.Marker(location).
        addTo(this.layer);
      user.avatarOverlay.marker.setIcon(user.getAvatarIcon());
    }
  },

  move: function(location) {
    if(this.marker) {
      this.marker.setLatLng(location.toJSON());
    }
  }
});
