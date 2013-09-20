$(function() {

  var map = new L.Map('map', {
    center: config.map.center,
    zoom: config.map.zoom - 3, //FIXME #magicnumber
    attributionControl: false,
    zoomControl: false
  });
  var basemapCloudmade = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  }).addTo(map);

  var usersControl = new L.Control.Layers(undefined, undefined, { collapsed: false, position: 'topleft' }).addTo(map);
  var poisControl = new L.Control.Layers({ "OSM": basemapCloudmade }, undefined, { collapsed: false, position: 'topright' }).addTo(map);

  var users = new UsersCollection();
  users.on('change', function(user) {
    var label = '<img src="assets/images/avatars/' + user.get('avatar')  + '.png" /><em style="border-color:' + user.get('color') + '">' + user.get('nickname') + '</em>';
    usersControl.addOverlay(user.layerGroup, label);
  });

  // save(d) state
  var ids = [];

  if(localStorage.ids) {
    ids = JSON.parse(localStorage.ids);
  } else {
    localStorage.ids = JSON.stringify(ids);
  }

  if(ids.length > 0){
    // has saved records
    var userId, layerGroup;
    for(i=0;i<ids.length;i++) {
      userId = ids[i];
      layerGroup = new L.LayerGroup();
      layerGroup.addTo(map);
      usersControl.addOverlay(layerGroup, userId);
      user = new WatchedUser({
        uuid: userId,
        layerGroup: layerGroup
      });
      users.add(user);
      user.trigger('change', user);
    }
  }

  var media = new Story();
  var stream = new Stream({collection: media});

  var faye = new Faye.Client(config.pubsub.url+ '/faye');

  // faye -> user/story/track collections
  var channel = '/bolzano/**';
  faye.subscribe(channel, function(message) {
    console.log(message);
    var userId;
    var type = message["@type"];
    if(type === "profile") {
      userId = message.uuid;
    } else {
      userId = message.user;
    }
    var user = users.get(userId);
    if(! user) {
      var layerGroup = new L.LayerGroup();
      layerGroup.addTo(map);
      usersControl.addOverlay(layerGroup, userId);
      user = new WatchedUser({
        uuid: userId,
        layerGroup: layerGroup
      });
      users.add(user);


      if(type === 'profile') user.trigger('change', user);
    }
    switch(type){
    case 'capture':
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
  }.bind(this));

  window.app = {
    users: users
  };
});
