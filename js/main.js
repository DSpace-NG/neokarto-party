$(function() {

  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var RemotePlayer = require('dspace-api-core/models/remotePlayer');
  var Team = require('dspace-api-core/collections/team');

  var BayeuxHub = require('dspace-api-bayeux/hub');
  //var StoryOverlay = require('dspace-ui-leaflet/overlays/story');
  var TrackOverlay = require('dspace-ui-leaflet/overlays/track');
  var AvatarOverlay = require('dspace-ui-leaflet/overlays/avatar');


  var config = require('../config');
  var UUID = require('node-uuid');

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
  var DSpace = function(config){
    this.hubs = {};

    this.hubs[config.url] = new BayeuxHub(config.url);

    // FIXME support multiple realms
    this.realm = this.hubs[config.url].getChannel(config.roster.path);

    this.getChannel = function(template){
      var hub = this.hubs[template.url];
      if(!hub){
        hub = new BayeuxHub(template.url);
        this.hubs[template.url] = hub;
      }
      return hub.getChannel(template.path);
    }.bind(this);

    this.getGeolocationChannel = function(template){
      var hub = this.hubs[template.url];
      if(!hub){
        hub = new BayeuxHub(template.url);
        this.hubs[template.url] = hub;
      }
      return hub.getGeolocationChannel(template.path);
    }.bind(this);

    // various handy functions
    this.utils = {

      // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
      randomColor: function(){ return '#' + Math.floor(Math.random()*16777215).toString(16); }
    };
  };

  // FIXME support multiple realms
  var dspace = new DSpace(config.realm);

  var uuid;
  if(localStorage.profile) {
    uuid = localStorage.uuid;
  } else {
    uuid =  UUID();
    localStorage.uuid = uuid;
  }

  config.player.uuid = uuid;
  config.player.channels.track.path =  '/' + uuid + '/track';
  config.player.color = dspace.utils.randomColor();

  var localPlayer = new LocalPlayer(config.player, { dspace: dspace });

  localPlayer.geolocation.enable();

  // if no profile prompt for it
  //if(!localPlayer.get('nickname')) {
  //new ProfileModal( { player: localPlayer } );
  //}

  // create avatar overlay
  var avatarOverlay = new AvatarOverlay({
    model: localPlayer,
    layer: layerGroup
  });

  var trackOverlay = new TrackOverlay({
    collection: localPlayer.track,
    color: localPlayer.get('color'),
    layer: layerGroup
  });

  //var storyOverlay = new StoryOverlay({
  //collection: localPlayer.story,
  //layer: layerGroup
  //});


  var roster = {};
  roster.local = localPlayer;
  roster.remote = new Team();

  roster.blue = new Team();
  roster.red = new Team();
  roster.misc = new Team();

  _.each(['blue', 'red', 'misc'], function(name){
    var lg_avatars = new L.LayerGroup();
    var lg_tracks = new L.LayerGroup();
    roster[name].avatarsLayer = lg_avatars;
    roster[name].tracksLayer = lg_tracks;
    lg_avatars.addTo(map);
    lg_tracks.addTo(map);
    playersControl.addOverlay(lg_avatars, name + '-avatars');
    playersControl.addOverlay(lg_tracks, name + '-tracks');
  });



  var publishPlayer = function(player){
    dspace.realm.publish(player.toJSON());
  };

  // 1. fetches current state of game TODO
  // 2. subscribe to position and players
  // 3. publishes one's own players
  dspace.realm.subscribe(function(message){
    if(message.uuid !== localPlayer.get('uuid')){
      receivedPlayer(message);
    }
  }.bind(this));
  publishPlayer(localPlayer);
  localPlayer.on('change', publishPlayer);

  var receivedPlayer = function(player){
    var selectedPlayer = roster.remote.get(player.uuid);
    //FIXME move logix to collection!
    if(selectedPlayer){
      selectedPlayer.set(player);
    } else {
      console.log('addPlayer:', player.nickname);
      var newPlayer = new RemotePlayer(player, { dspace: dspace });
      var avatarGroup = roster.misc.avatarsLayer;
      var tracksGroup = roster.misc.tracksLayer;
      if(newPlayer.get('team')){
        avatarGroup = roster[newPlayer.get('team')].avatarsLayer;
        tracksGroup = roster[newPlayer.get('team')].tracksLayer;
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

      roster.remote.add(newPlayer);
    }
  };


  /**
   ** VIEWS
   **/

  //// button(s) in top-right corner
  var controls = new ControlsView({ player: localPlayer });

  //#debug
  dspace.map = map;
  dspace.roster = roster;
  window.dspace = dspace;

});
