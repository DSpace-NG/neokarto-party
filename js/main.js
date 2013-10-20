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
  var Roster = Backbone.Collection.extend({

    model: RemotePlayer,

    initialize: function(attrs, options){
      this.feed = options.feed;
      this.channel = options.channel;
    },

    // remove oneself!
    parse: function(response){
      _.remove(response, function(resource){ return resource.uuid === localStorage.uuid; });
      return response;
    }

    // convenience proxies ?
    //this.subscribe = function(){};
    //this.publish = function(){};

  });

  var Party = function(template, dspace){

    this.dspace = dspace;

    var rosterFeed = {}; //dspace.getFeed(template.feeeds.roster);
    var rosterChannel = dspace.getChannel(template.channels.roster);
    this.roster = new Roster([], {
      feed: rosterFeed,
      channel: rosterChannel,
      url: template.feeds.roster.url + template.feeds.roster.path
    });

  };

  var DSpace = function(config){

    this.config = config;

    // keeps track on hubs to prevening creating duplicates when requiesting channels
    this.hubs = {};

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

    // FIXME support multiple parties!
    this.party = new Party(config.party, this);


    // various handy functions
    this.utils = {

      // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
      randomColor: function(){ return '#' + Math.floor(Math.random()*16777215).toString(16); }
    };
  };

  var dspace = new DSpace(config);

  //#debug
  dspace.map = map;
  window.dspace = dspace;

  dspace.party.roster.fetch();

  var uuid;
  if(localStorage.uuid) {
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
  if(localStorage.nickname){
    localPlayer.set('nickname', localStorage.nickname);
  }
  if(!localPlayer.get('nickname')) {
    new ProfileModal( { player: localPlayer } );
  }
  localPlayer.on('change:nickname', function(player){
    localStorage.nickname = player.get('nickname');
  });

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

  dspace.party.roster.local = localPlayer;
  dspace.party.roster.remote = new Team();

  var createTeamOverlays = function(name){
    var lg_avatars = new L.LayerGroup();
    dspace.party.roster[name].avatarGroup = lg_avatars;
    lg_avatars.addTo(map);
    playersControl.addOverlay(lg_avatars, name + '-avatars');

    var lg_tracks = new L.LayerGroup();
    dspace.party.roster[name].trackGroup = lg_tracks;
    lg_tracks.addTo(map);
    playersControl.addOverlay(lg_tracks, name + '-tracks');
  };

  _.each(config.teams, function(team){
    var name = team.name;
    dspace.party.roster[team.name] = new Team();
    createTeamOverlays(team.name);

  });

  dspace.party.roster.misc = new Team();
  createTeamOverlays('misc');

  // 1. fetches current state of game TODO
  // 2. subscribe to position and players
  // 3. publishes one's own players
  dspace.party.roster.channel.subscribe(function(message){
    if(message.uuid !== localPlayer.get('uuid')){
      receivedPlayer(message);
    }
  }.bind(this));

  var publishPlayer = function(player){
    dspace.party.roster.channel.publish(player.toJSON());
  };
  publishPlayer(localPlayer);
  localPlayer.on('change', publishPlayer);

  var receivedPlayer = function(player){
    var selectedPlayer = dspace.party.roster.remote.get(player.uuid);
    //FIXME move logix to Roster!
    if(selectedPlayer){
      selectedPlayer.set(player);
    } else {
      console.log('addPlayer:', player.team);
      var newPlayer = new RemotePlayer(player, { dspace: dspace });
      var avatarGroup = dspace.party.roster.misc.avatarGroup;
      var trackGroup = dspace.party.roster.misc.trackGroup;
      if(newPlayer.get('team')){
        avatarGroup = dspace.party.roster[newPlayer.get('team')].avatarGroup;
        trackGroup = dspace.party.roster[newPlayer.get('team')].trackGroup;
      }

      createPlayerOverlays(newPlayer, avatarGroup, trackGroup);

      dspace.party.roster.remote.add(newPlayer);
    }
  };


  /**
   ** VIEWS
   **/

  //// button(s) in top-right corner
  var controls = new ControlsView({ player: localPlayer });

});
