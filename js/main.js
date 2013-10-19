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

  //#debug
  var app = {};
  app.map = map;
  window.app = app;

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

  var allPlayers = new Team();

  //#debug
  app.localPlayer = localPlayer;
  app.allPlayers = allPlayers;

  localPlayer.overlays = {};

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

  //#debug
  app.channels = channels;

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
    var selectedPlayer = allPlayers.get(player.uuid);
    //FIXME move logix to collection!
    if(selectedPlayer){
      selectedPlayer.set(player);
    } else {
      console.log('addPlayer');
      var newPlayer = new RemotePlayer(player);
      var lGroup = new L.LayerGroup();
      lGroup.addTo(map);
      var aOverlay = new AvatarOverlay({
        model: newPlayer,
        layer: lGroup
      });

      var tOverlay = new TrackOverlay({
        collection: newPlayer.track,
        color: newPlayer.get('color'),
        layer: lGroup
      });

      newPlayer.overlays = {};
      newPlayer.overlays.avatar = aOverlay;
      newPlayer.overlays.track = tOverlay;
      playersControl.addOverlay(lGroup, newPlayer.get('nickname'));
      allPlayers.add(newPlayer);
    }
  };

  var receivedPosition = function(position){
    var selectedPlayer = allPlayers.get(position.player.uuid);
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

});
