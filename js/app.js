$(function() {

  /**
   ** MODELS
   **/
  var user = new User();
  var bigBrother = new BigBrother(user);

  /**
   ** VIEWS
   **/

  // button(s) in top-right corner
  var controls = new ControlsView({ user: user });

  // leaflet map
  $('body').append('<div id="map"></div>');
  var map = new L.Map('map', { 
    center: config.map.center, 
    zoom: config.map.zoom, 
    attributionControl: false 
  });

  // add openstreetmap layer
  var basemapCloudmade = new L.TileLayer(config.map.basemap, {
    maxZoom : 19
  });
  map.addLayer(basemapCloudmade);

  /**
   ** MAIN
   **/

  // when location changes, add / update user marker,
  // and update location.
  user.track.on('add', function(location) {
    var latlng = new L.latLng(location.get('lat'), location.get('lng'));
    if(user.marker) { // position changed.
      user.marker.setLatLng(latlng);
      if(user.get('followMe')) {
        map.setView(latlng, 15);
      }
    } else { // acquired position for first time.
      user.marker = L.marker(latlng, {
        icon: user.getAvatarIcon()
      }).addTo(map);
      map.setView(latlng, 15);
    }
  });

  // hook up leaflet's locate() to user model
  map.on('locationfound', user.updateLocation);
  map.on('locationerror', function(e) {
    console.error("Failed to acquire position: " + e.message);
  });
  map.locate({
    setView: false,
    watch: true,
    maximumAge: 15000,
    enableHighAccuracy: true
  });

  var baseMaps = { 
    'OpenStreetMap':basemapCloudmade
  };

  var overlayMaps = { 
    //'OpenStreetMap':basemapCloudmade 
  };

  user.notesOverlay = new NotesOverlay({ collection: user.notes, map: map });

  window.app = {
    user: user,
    map: map
  };
});
