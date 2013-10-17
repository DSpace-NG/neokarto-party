$(function() {

  var DSpace = require('dspace-api-core/dspace');
  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var BayeuxHub = require('dspace-api-bayeux/hub');
  //var StoryOverlay = require('dspace-ui-leaflet/overlays/story');
  var TrackOverlay = require('dspace-ui-leaflet/overlays/track');
  var AvatarOverlay = require('dspace-ui-leaflet/overlays/avatar');


  var config = require('../config');

  var ProfileModal = require('./views/profileModal');
  var ControlsView = require('./views/controls');

  var dspace = new DSpace('elevate');

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
  app.dspace = dspace;
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

  // we can start using dspace only once ready
  dspace.on('ready', function(){

    console.log('dspace ready!');

    /**
     ** MODELS
     **/
    var player = new LocalPlayer({}, { store: dspace.store });

    //#debug
    app.player = player;
    player.overlays = {};

    var loadedPlayer = function(){

      // if no profile prompt for it
      if(!player.get('nickname')) {
        player.set({
          // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          avatar: 'escafandra'// FIXME no magic values inline please ;)
        }, { silent: true });
        new ProfileModal( { player: player } );
      }

      // create avatar overlay
      var avatarOverlay = new AvatarOverlay({
        model: player,
        layer: layerGroup
      });
      player.overlays.avatar = avatarOverlay;

      var trackOverlay = new TrackOverlay({
        collection: player.track,
        color: player.get('color'),
        layer: layerGroup
      });
      player.overlays.track = trackOverlay;
      //var storyOverlay = new StoryOverlay({
      //collection: player.story,
      //layer: layerGroup
      //});

      joinGame();
    };

    player.on('loaded', loadedPlayer);
    player.load();

    /*
     * CHANNELS
     */
    var pubsub = new BayeuxHub(config.pubsub.url);
    var channels = {};

    //#debug
    app.channels = channels;

    channels.positions = pubsub.getChannel('/positions/' + player.get('uuid'));
    channels.profiles = pubsub.getChannel('/profiles/' + player.get('uuid'));

    var publishProfile = function(profile){
      channels.profiles.publish(profile);
    };

    var publishPosition = function(position){
      console.log('publish position');
      channels.positions.publish(position);
    };

    var receivedPosition = function(message){
      console.log(message);
    };

    var receivedProfile = function(message){
      console.log(message);
    };

    // on join player
    // 1. fetches current state of game TODO
    // 2. subscribe to position and profiles
    // 3. publishes one's own profile
    var joinGame = function(){
      channels.positions.subscribe(function(message){
        if(message.from !== player.get('uuid')){
          receivedPosition(message);
        }
      });
      channels.profiles.subscribe(function(message){
        if(message.from !== player.get('uuid')){
          receivedProfile(message);
        }
      });
      publishProfile(player.toJSON());
      player.on('change:position', publishPosition);
    };

    /**
     ** VIEWS
     **/

    //// button(s) in top-right corner
    var controls = new ControlsView({ player: player });


  });
});
