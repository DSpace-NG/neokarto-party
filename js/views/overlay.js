var Overlay = Backbone.View.extend({
  initialize: function(){
    this.layer = new L.LayerGroup();
    this.layer.addTo(this.options.map);

    _.bindAll(this, 'renderData');

    this.collection.on('add', this.renderData);
  }
});

var StoryOverlay = Overlay.extend({
  icon: L.icon({
    iconUrl: 'assets/images/markers/bubble.png',
    iconSize: [32, 32],
    iconAnchor: [9, 29]
  }),

  renderData: function(note) {
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

  renderData: function(point) {
    this.track.addLatLng(point.attributes);
    if(this.marker) {
      this.marker.setLatLng(point.attributes);
    } else {
      this.marker = new L.Marker(point.attributes).
        addTo(this.layer);
    }
  }
});
