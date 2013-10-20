$(function() {

  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var RemotePlayer = require('dspace-api-core/models/remotePlayer');
  //var Team = require('dspace-api-core/collections/team');

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

  // FIXME seams mixed sutuff from Party
  var Roster = Backbone.Collection.extend({

    model: RemotePlayer,

    initialize: function(attrs, options){
      _.bindAll(this, 'partition', 'createTeamLayerControl', 'receivedPlayer', 'playerPostCreate');

      this.teams = {};

      //this.feed = options.feed; FIXME
      // partition after fetching feed
      this.on('reset', this.partition);
      this.fetch({ reset: true });

      this.channel = options.channel;
      this.channel.subscribe(function(message){
        if(message.uuid !== localPlayer.get('uuid')){
          this.receivedPlayer(message);
        }
      }.bind(this));

    },

    // remove oneself!
    parse: function(response){
      _.remove(response, function(resource){ return resource.uuid === localStorage.uuid; });
      return response;
    },

    // called after initial fetch of roster
    partition: function(){
      _.forEach(config.teams, function(team){
        this.teams[team.name] = new Backbone.VirtualCollection(this, { filter: { team: team.name } });
        this.teams[team.name].name = team.name;
      }, this);

      this.teams.misc = new Backbone.VirtualCollection(this, { filter: { team: undefined } });
      this.teams.misc.name = 'misc';

      _.each(this.teams, function(team){
        this.createTeamLayerControl(team);
      }.bind(this));

      _.each(this.models, function(player){
        this.playerPostCreate(player);
      }.bind(this));
    },

    createTeamLayerControl: function(team){
      var lg_avatars = new L.LayerGroup();
      team.avatarGroup = lg_avatars;
      lg_avatars.addTo(map);
      playersControl.addOverlay(lg_avatars, team.name + '-avatars');

      var lg_tracks = new L.LayerGroup();
      team.trackGroup = lg_tracks;
      lg_tracks.addTo(map);
      playersControl.addOverlay(lg_tracks, team.name + '-tracks');
    },

    receivedPlayer: function(player){
      var selectedPlayer = this.get(player.uuid);
      //FIXME move logix to Roster!
      if(selectedPlayer){
        selectedPlayer.set(player);
      } else {
        console.log('addPlayer:', player.team);
        var newPlayer = new RemotePlayer(player);
        this.playerPostCreate(newPlayer);
      }
    },

    playerPostCreate: function(player){
      var avatarGroup = dspace.party.roster.teams.misc.avatarGroup;
      var trackGroup = dspace.party.roster.teams.misc.trackGroup;
      if(player.get('team')){
        avatarGroup = this.teams[player.get('team')].avatarGroup;
        trackGroup = this.teams[player.get('team')].trackGroup;
      }

      createPlayerOverlays(player, avatarGroup, trackGroup);
    }
  });

  var Party = function(template, dspace){

    this.dspace = dspace;

    var rosterFeed = {}; //dspace.getFeed(template.feeeds.roster);
    var rosterChannel = dspace.getChannel(template.channels.roster);
    this.roster = new Roster([], {
      feed: rosterFeed,
      channel: rosterChannel,
      url: template.feeds.roster.url + template.feeds.roster.path // FIXME use feed?
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

  createPlayerOverlays(localPlayer, layerGroup, layerGroup);

  //var storyOverlay = new StoryOverlay({
  //collection: localPlayer.story,
  //layer: layerGroup
  //});

  dspace.party.roster.local = localPlayer;

  // PLAY!
  var publishPlayer = function(player){
    dspace.party.roster.channel.publish(player.toJSON());
  };
  publishPlayer(localPlayer);
  localPlayer.on('change', publishPlayer);


  /**
   ** VIEWS
   **/

  //// button(s) in top-right corner
  var controls = new ControlsView({ player: localPlayer });

});
