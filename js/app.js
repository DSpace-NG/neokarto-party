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
  var map = new L.Map('map', { center: [46.5, 11.35], zoom: 14, attributionControl: false });

  var basemapCloudmade = new L.TileLayer('http://a.tile.cloudmade.com/e4e152a60cc5414eb81532de3d676261/997/256/{z}/{x}/{y}.png', {
    maxZoom : 19
  });
  map.addLayer(basemapCloudmade);

  // avatar (used for user marker)
  // FIXME: acquire email address and display avatar instead?
  var avatar = 'scientist';
  var avatarURL = 'assets/images/avatars/'+ avatar +'.png';
  var PixelIcon = L.Icon.extend({
    options: {
        iconSize:     [48, 48],
        iconAnchor:   [24, 48],
        popupAnchor:  [-3, -76]
    }
  });
  var avatarIcon = new PixelIcon({iconUrl: avatarURL});
  // actual user marker. initialized once initial position has been acquired.
  var userMarker;

  /**
   ** MAIN
   **/

  // when location changes, add / update user marker,
  // and update location.
  user.on('location-changed', function(location) {
    if(userMarker) { // position changed.
      userMarker.setLatLng(location);
      if(user.get('followMe')) {
        map.setView(location, 15);
      }
    } else { // acquired position for first time.
      userMarker = L.marker(location, {
        icon: avatarIcon
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
    //"Geoimage": Geoimage
    'OpenStreetMap':basemapCloudmade
  };
  
  var overlayMaps = { 
    //'OpenStreetMap':basemapCloudmade 
  };

  user.notesOverlay = new Overlay({ collection: user.notes, map: map });

  //L.control.layers(baseMaps, overlayMaps).addTo(map);
  L.control.scale({imperial:false}).addTo(map);

  window.app = {
    user: user,
    map: map
  };
});
