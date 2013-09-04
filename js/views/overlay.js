var Overlay = Backbone.View.extend({

  initialize: function(){
    this.layer = new L.LayerGroup();
    this.layer.addTo(this.options.map);

    this.icon = L.icon({
      iconUrl: 'assets/images/markers/bubble.png',
      iconSize: [32, 32],
      iconAnchor: [9, 55]
    });

    this.collection.on('add', function(data){
      console.log(data);
      var loc = data.attributes.location;
      var marker = new L.Marker([loc.lat, loc.lng], {
        icon: this.icon
      });
      this.layer.addLayer(marker);
    }.bind(this));
  }
});
