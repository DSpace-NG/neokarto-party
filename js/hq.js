$(function() {

  var map = new L.Map('map', {
    center: config.map.center,
    zoom: config.map.zoom - 3,
    attributionControl: false
  });
  var basemapCloudmade = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  });
  map.addLayer(basemapCloudmade);

  var layerControl = new L.Control.Layers(undefined, undefined, { collapsed: false }).addTo(map);

  var users = new UsersCollection();
  var media = new Story();
  var stream = new Stream({collection: media});

  var faye = new Faye.Client(config.pubsub.url+ '/faye');

  // faye -> user/notes/track collections
  var channel = '/bolzano/**';
  faye.subscribe(channel, function(message) {
    var userId;
    var type = message["@type"];
    if(type === "profile") {
      userId = message.id;
    } else {
      userId = message.user;
    }
    var user = users.get(userId);
    if(! user) {
      user = new WatchedUser({
        id: userId,
        map: map,
        layerControl: layerControl
      });
      users.add(user);
    }
    switch(type){
    case 'note':
      user.story.add(message);
      if(message.mediaType){
        media.add(message);
      }
      break;
    case 'location':
      user.track.add(message);
      break;
    case 'profile':
      user.set(message);
      break;
    default:
      console.log("WARNING: unhandled record!", message);
    }
  });

  window.app = {
    users: users
  };
});
