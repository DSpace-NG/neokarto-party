var Overlay = Backbone.View.extend({
  initialize: function(){
    this.layer = new L.LayerGroup();
    this.layer.addTo(this.options.map);

    _.bindAll(this, 'renderData');

    this.collection.on('add', this.renderData);
  }
});

var NotesOverlay = Overlay.extend({
  icon: L.icon({
    iconUrl: 'assets/images/markers/bubble.png',
    iconSize: [32, 32],
    iconAnchor: [9, 29]
  }),

  renderData: function(note) {
    var location = note.attributes.location;
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
    this.options.user.track.overlay = this; //FIXME
    this.color = this._randomColor();
    this.track = new L.Polyline([], {
      color: this.color
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
  },

  _randomColor: function() {
    var color = '#';
    for(var i=0;i<3;i++) {
      color += Math.floor((Math.random() * 100000) % 256).
        toString(16);
    }
    return color;
  }
});
