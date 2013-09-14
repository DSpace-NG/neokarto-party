$(function() {

  // leaflet map
  $('body').append('<div id="map"></div>');
  var map = new L.Map('map', { 
    center: config.map.center, 
    zoom: config.map.zoom, 
    attributionControl: false 
  });

  // add openstreetmap layer
  var basemapCloudmade = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  });
  map.addLayer(basemapCloudmade);
  var layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  /**
   ** MODELS
   **/
  var user = new User({ layerGroup: layerGroup });

  /**
   ** VIEWS
   **/

  // button(s) in top-right corner
  var controls = new ControlsView({ user: user });


  /**
   ** MAIN
   **/

  // FIXME make possible to switch on/off from UI
  //user.followMe = true;

  // when location changes, add / update user's avatar
  // and update location.
  user.track.on('add', function(location) {
    var latlng = new L.latLng(location.get('lat'), location.get('lng'));
    if(user.avatarOverlay.avatar) { // position changed.
      if(user.followMe) {
        map.setView(latlng, config.map.zoom);
      }
    } else { // acquired position for first time.
      map.setView(latlng, config.map.zoom);
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

  // initial profile
  user.trigger('change', user);

  window.app = {
    user: user,
    map: map
  };
});
