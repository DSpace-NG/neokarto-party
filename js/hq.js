$(function() {

  // CORS proxy
  jQuery.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
      options.url = config.proxy.url + '/' + options.url;
    }
  });

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
  var userOverlays = {};
  //FIXME
  users.on('change', function(user) {
    var label = '<img src="assets/images/avatars/' + user.get('avatar')  + '.png" /><em style="border-color:' + user.get('color') + '">' + user.get('nickname') + '</em>';
    usersControl.addOverlay(userOverlays[user.get('uuid')].layer, label);
  });

  // save(d) state

  var createOverlays = function(user, layer){
    userOverlays[user.get('uuid')] = {};
    var group = userOverlays[user.get('uuid')];
    group.layer = layer;
    group.story = new StoryOverlay({
      collection: user.story,
      layer: layer
    });
    group.track = new TrackOverlay({
      collection: user.track,
      color: user.get('color'),
      layer: layer
    });
    group.avatar = new AvatarOverlay({
      model: user,
      layer: layer
    });
  };

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
      });

      createOverlays(user, layerGroup);

      users.add(user);

      user.trigger('change', user); //to set initial avatar
    }
  }

  var media = new Story({ url: 'media' });
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
        uuid: userId
      });

      createOverlays(user, layerGroup);

      users.add(user);
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
    //FIXME this.trackOverlay.track.setStyle({color: this.get('color')});
      break;
    default:
      console.log("WARNING: unhandled record!", message);
    }
  }.bind(this));

  window.app = {
    users: users
  };
});
