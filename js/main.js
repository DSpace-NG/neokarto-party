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
    var player = new LocalPlayer();

    //#debug
    app.player = player;
    player.overlays = {};

    if(!player.profile) {
      player.set({
        // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        avatar: 'cupido'// FIXME no magic values inline please ;)
      }, { silent: true });
      //new ProfileModal( {player: player} ); FIXME
    }

    /*
     * CHANNELS
     */
    var pubsub = new BayeuxHub(config.pubsub.url);
    var channels = {};

    //#debug
    app.channels = channels;

    channels.positions = pubsub.getChannel('/positions');
    channels.positions.subscribe(function(message){
      if(message.from !== player.get('uuid')){
        console.log(message);
      }
    });

    var publishPosition = function(position){
      var message = {
        from: player.get('uuid'),
        type: '@position',
        body: position
      };
      channels.positions.publish(message);
    };

    player.on('change:position', publishPosition);

    /**
     ** VIEWS
     **/

    var avatarOverlay = new AvatarOverlay({
      model: player,
      layer: layerGroup
    });
    player.overlays.avatar = avatarOverlay;

    //// button(s) in top-right corner
    var controls = new ControlsView({ player: player });

    //var storyOverlay = new StoryOverlay({
      //collection: player.story,
      //layer: layerGroup
    //});
    var trackOverlay = new TrackOverlay({
      collection: player.track,
      color: player.get('color'),
      layer: layerGroup
    });
    player.overlays.track = trackOverlay;

  });
});
