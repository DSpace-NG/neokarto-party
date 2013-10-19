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
  var basemap = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  }).addTo(map);

  var zoomControl = new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

  var playersControl = new L.Control.Layers(undefined, undefined, { collapsed: true, position: 'topleft' }).addTo(map);
  $('.leaflet-left .leaflet-control-layers-toggle')[0].classList.add('icon-profile');

  var poisControl = new L.Control.Layers({ "OSM-MapBox": basemap }, undefined, { collapsed: true, position: 'topright' }).addTo(map);
  $('.leaflet-right .leaflet-control-layers-toggle')[0].classList.add('icon-marker');

  var layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

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

  var createPlayerOverlays = function(player, avatarGroup, trackGroup){
    var avatarOverlay = new AvatarOverlay({
      model: player,
      layer: avatarGroup
    });

    var trackOverlay = new TrackOverlay({
      collection: player.track,
      color: player.get('color'),
      layer: trackGroup
    });
  };

  createPlayerOverlays(localPlayer, layerGroup, layerGroup);

  //var storyOverlay = new StoryOverlay({
  //collection: localPlayer.story,
  //layer: layerGroup
  //});


  var roster = {};
  roster.local = localPlayer;
  roster.remote = new Team();

  var createTeamOverlays = function(name){
    var lg_avatars = new L.LayerGroup();
    roster[name].avatarGroup = lg_avatars;
    lg_avatars.addTo(map);
    playersControl.addOverlay(lg_avatars, name + '-avatars');

    var lg_tracks = new L.LayerGroup();
    roster[name].trackGroup = lg_tracks;
    lg_tracks.addTo(map);
    playersControl.addOverlay(lg_tracks, name + '-tracks');
  };

  _.each(config.teams, function(team){
    var name = team.name;
    roster[team.name] = new Team();
    createTeamOverlays(team.name);

  });

  roster.misc = new Team();
  createTeamOverlays('misc');

  // 1. fetches current state of game TODO
  // 2. subscribe to position and players
  // 3. publishes one's own players
  dspace.realm.subscribe(function(message){
    if(message.uuid !== localPlayer.get('uuid')){
      receivedPlayer(message);
    }
  }.bind(this));

  var publishPlayer = function(player){
    dspace.realm.publish(player.toJSON());
  };
  publishPlayer(localPlayer);
  localPlayer.on('change', publishPlayer);

  var receivedPlayer = function(player){
    var selectedPlayer = roster.remote.get(player.uuid);
    //FIXME move logix to collection!
    if(selectedPlayer){
      selectedPlayer.set(player);
    } else {
      console.log('addPlayer:', player.team);
      var newPlayer = new RemotePlayer(player, { dspace: dspace });
      var avatarGroup = roster.misc.avatarGroup;
      var trackGroup = roster.misc.trackGroup;
      if(newPlayer.get('team')){
        avatarGroup = roster[newPlayer.get('team')].avatarGroup;
        trackGroup = roster[newPlayer.get('team')].trackGroup;
      }

      createPlayerOverlays(newPlayer, avatarGroup, trackGroup);

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
