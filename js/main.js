$(function() {

  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var RemotePlayer = require('dspace-api-core/models/remotePlayer');
  var Team = require('dspace-api-core/collections/team');

  var BayeuxHub = require('dspace-api-bayeux/hub');
  //var StoryOverlay = require('dspace-ui-leaflet/overlays/story');
  var TrackOverlay = require('dspace-ui-leaflet/overlays/track');
  var AvatarOverlay = require('dspace-ui-leaflet/overlays/avatar');


  var config = require('../config');

  var ProfileModal = require('./views/profileModal');
  var ControlsView = require('./views/controls');

  // leaflet map
  $('body').append('<div id="map"></div>');
  var map = new L.Map('map', {
    center: config.map.center,
    zoom: config.map.zoom,
    attributionControl: false,
    zoomControl: false
  });

  //// add openstreetmap layer
  var basemapCloudmade = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  }).addTo(map);

  var zoomControl = new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

  var playersControl = new L.Control.Layers(undefined, undefined, { collapsed: true, position: 'topleft' }).addTo(map);
  $('.leaflet-left .leaflet-control-layers-toggle')[0].classList.add('icon-profile');

  var poisControl = new L.Control.Layers({ "OSM": basemapCloudmade }, undefined, { collapsed: true, position: 'topright' }).addTo(map);
  $('.leaflet-right .leaflet-control-layers-toggle')[0].classList.add('icon-marker');

  var layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  playersControl.addOverlay(layerGroup, 'me');

  /**
   ** MODELS
   **/
  var localPlayer = new LocalPlayer();
  var teams = {};

  teams.all = new Team();
  teams.blue = new Team();
  teams.red = new Team();
  teams.misc = new Team();
  _.each(['blue', 'red', 'misc'], function(name){
    var lg_avatars = new L.LayerGroup();
    var lg_tracks = new L.LayerGroup();
    teams[name].avatarsLayer = lg_avatars;
    teams[name].tracksLayer = lg_tracks;
    lg_avatars.addTo(map);
    lg_tracks.addTo(map);
    playersControl.addOverlay(lg_avatars, name + '-avatars');
    playersControl.addOverlay(lg_tracks, name + '-tracks');
  });

  // if no profile prompt for it
  //if(!localPlayer.get('nickname')) {
    localPlayer.set({
      // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      avatar: 'escafandra'// FIXME no magic values inline please ;)
    }, { silent: true });
    //new ProfileModal( { player: localPlayer } );
    //#debug
    localPlayer.set('nickname', 'tester');
  //}

  localPlayer.overlays = {};

  // create avatar overlay
  var avatarOverlay = new AvatarOverlay({
    model: localPlayer,
    layer: layerGroup
  });
  localPlayer.overlays.avatar = avatarOverlay;

  var trackOverlay = new TrackOverlay({
    collection: localPlayer.track,
    color: localPlayer.get('color'),
    layer: layerGroup
  });
  localPlayer.overlays.track = trackOverlay;

  //var storyOverlay = new StoryOverlay({
  //collection: localPlayer.story,
  //layer: layerGroup
  //});

  localPlayer.geolocation.enable();

  /*
   * CHANNELS
   */
  var pubsub = new BayeuxHub(config.pubsub.url);
  var channels = {};

  channels.positions = pubsub.getChannel('/positions');
  channels.players = pubsub.getChannel('/players');

  var publishPlayer = function(player){
    channels.players.publish(player.toJSON());
  };

  var publishPosition = function(position){
    position.player = {};
    position.player.uuid = localPlayer.get('uuid');
    channels.positions.publish(position);
  };

  var receivedPlayer = function(player){
    var selectedPlayer = teams.all.get(player.uuid);
    //FIXME move logix to collection!
    if(selectedPlayer){
      selectedPlayer.set(player);
    } else {
      console.log('addPlayer', player);
      var newPlayer = new RemotePlayer(player);
      var avatarGroup = teams.misc.avatarsLayer;
      var tracksGroup = teams.misc.tracksLayer;
      if(newPlayer.get('team')){
        avatarGroup = teams[newPlayer.get('team')].avatarsLayer;
        tracksGroup = teams[newPlayer.get('team')].tracksLayer;
      }
      var aOverlay = new AvatarOverlay({
        model: newPlayer,
        layer: avatarGroup
      });

      var tOverlay = new TrackOverlay({
        collection: newPlayer.track,
        color: newPlayer.get('color'),
        layer: tracksGroup
      });

      newPlayer.overlays = {};
      newPlayer.overlays.avatar = aOverlay;
      newPlayer.overlays.track = tOverlay;
      teams.all.add(newPlayer);
    }
  };

  var receivedPosition = function(position){
    var selectedPlayer = teams.all.get(position.player.uuid);
    if(selectedPlayer){
      selectedPlayer.track.add(position);
      selectedPlayer.trigger('change:position', position);
    } else {
      //fetchPlayer(uuid)
    }
  };

  // 1. fetches current state of game TODO
  // 2. subscribe to position and players
  // 3. publishes one's own players
  channels.positions.subscribe(function(message){
    if(message.player.uuid !== localPlayer.get('uuid')){
      receivedPosition(message);
    }
  });
  channels.players.subscribe(function(message){
    if(message.uuid !== localPlayer.get('uuid')){
      receivedPlayer(message);
    }
  });
  publishPlayer(localPlayer);
  localPlayer.on('change:position', publishPosition);
  localPlayer.on('change', publishPlayer);

  /**
   ** VIEWS
   **/

  //// button(s) in top-right corner
  var controls = new ControlsView({ player: localPlayer });

  //#debug
  var app = {};
  app.map = map;
  app.localPlayer = localPlayer;
  app.teams = teams;
  app.channels = channels;
  window.app = app;

});
