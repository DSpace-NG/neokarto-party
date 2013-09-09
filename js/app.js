$(function() {

  /**
   ** MODELS
   **/
  var user = new User();

  var bigBrother;
  user.on('id-assigned', function() {
    bigBrother = new BigBrother(user);
  });

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
  user.on('location-changed', function(location) {
    if(user.marker) { // position changed.
      user.marker.setLatLng(location);
      if(user.get('followMe')) {
        map.setView(location, 15);
      }
    } else { // acquired position for first time.
      user.marker = L.marker(location, {
        icon: user.getAvatarIcon()
      }).addTo(map);
      map.setView(location, 15);
    }
  });

  // hook up leaflet's locate() to user model
  map.on('locationfound', user.setLocation);
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
