$(function() {

  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var RemotePlayer = require('dspace-api-core/models/remotePlayer');

  var BayeuxHub = require('dspace-api-bayeux/hub');
  var HTTPHub = require('dspace-api-core/hubs/http');
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

  var basemap = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  }).addTo(map);

  var zoomControl = new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

  var poisControl = new L.Control.Layers({ "OSM-MapBox": basemap }, undefined, { collapsed: true, position: 'topright' }).addTo(map);

  /**
   ** MODELS
   **/
  var Portal = function(config, nexus){

    _.extend(this, Backbone.Events);

    this.feed = nexus.getFeed(config.feed);
    this.feed.fetch(function(roster){
      this.trigger('roster', roster);
    }.bind(this));

    this.channel = nexus.getChannel(config.channel);
    this.channel.subscribe(function(message){
      if(message.uuid !== localPlayer.get('uuid')){
        this.trigger('player', message);
      }
    }.bind(this));
  };

  var Party = Backbone.Collection.extend({

    model: RemotePlayer,

    initialize: function(attrs, options){

      this.config = options.config;
      this.nexus = options.nexus;

      this.portal = new Portal(this.config.portal, this.nexus);

      this.teams = {};

      _.forEach(config.teams, function(team){
        this.teams[team.name] = new Backbone.VirtualCollection(this, { filter: { team: team.name } });
        this.teams[team.name].name = team.name;
      }, this);
      this.teams.unteam = new Backbone.VirtualCollection(this, { filter: { team: undefined } });
      this.teams.unteam.name = 'unteam';

      this.portal.on('roster', function(roster){
        this.reset(roster, { nexus: this.nexus });
      }.bind(this));

      this.portal.on('player', function(player){
        this.add(player, { nexus: this.nexus });
      }.bind(this));
    },

    // remove oneself!
    parse: function(response){
      _.remove(response, function(resource){ return resource.uuid === localStorage.uuid; });
      return response;
    }
  });

  var Nexus = function(){
    // keeps track on hubs to prevening creating duplicates when requiesting channels
    this.hubs = {};

    this.getFeed = function(template){
      var protocol = template.protocol;
      if(!protocol) protocol = 'http';
      var hub;
      if(this.hubs[protocol]){
        hub = this.hubs[protocol][template.url];
      } else {
        this.hubs[protocol] = {};
      }
      if(!hub){
        // FIXME manage various protocols
        hub = new HTTPHub(template.url);
        this.hubs[protocol][template.url] = hub;
      }
      return hub.getFeed(template.path);
    }.bind(this);

    this.getChannel = function(template){
      var protocol = template.protocol;
      if(!protocol) protocol = 'http';
      var hub;
      if(this.hubs[protocol]){
         hub = this.hubs[protocol][template.url];
      } else {
        this.hubs[protocol] = {};
      }
      if(!hub){
        // FIXME manage various protocols
        hub = new BayeuxHub(template.url);
        this.hubs[protocol][template.url] = hub;
      }
      return hub.getChannel(template.path);
    }.bind(this);

    // FIXME getTrackChannel?
    this.getGeolocationChannel = function(template){
      var hub = this.hubs[template.url];
      if(!hub){
        hub = new BayeuxHub(template.url);
        this.hubs[template.url] = hub;
      }
      return hub.getGeolocationChannel(template.path);
    }.bind(this);
  };

  // FIXME checkout view managers!
  var Roster = function(party){

    this.party = party;

    this.playersControl = new L.Control.Layers(undefined, undefined, { collapsed: true, position: 'topleft' }).addTo(map);

    this.layerGroups = {};

    _.each(this.party.teams, function(team){
      var name = team.name;
      if(name === undefined) name = 'unteam';

      this.layerGroups[name] = {};


      var avatars = new L.LayerGroup();
      avatars.addTo(map);
      this.layerGroups[name].avatar = avatars;
      this.playersControl.addOverlay(avatars, name + '-avatars');

      var tracks = new L.LayerGroup();
      tracks.addTo(map);
      this.layerGroups[name].track = tracks;
      this.playersControl.addOverlay(tracks, name + '-tracks');
    }.bind(this));

    this.createPlayerOverlays = function(player, layerGroups){
      var avatarOverlay = new AvatarOverlay({
        model: player,
        layer: layerGroups.avatar
      });

      var trackOverlay = new TrackOverlay({
        collection: player.track,
        color: player.get('color'),
        layer: layerGroups.track
      });
    };


    this.party.on('add', function(player){
      var teamName = player.get('team');
      if(teamName === undefined) teamName = 'unteam';

      this.createPlayerOverlays(player, this.layerGroups[teamName]);

    }.bind(this));
  };

  var DSpace = function(config){

    this.config = config;

    this.nexus = new Nexus();

    // FIXME support multiple parties!
    this.party = new Party([], {config: config.party, nexus: this.nexus });

    this.roster = new Roster(this.party);

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

  var localPlayer = new LocalPlayer(config.player, { nexus: dspace.nexus });

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

  var layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  dspace.roster.createPlayerOverlays(localPlayer, { avatar: layerGroup, track: layerGroup });

  //var storyOverlay = new StoryOverlay({
  //collection: localPlayer.story,
  //layer: layerGroup
  //});


  // PLAY!
  var publishPlayer = function(player){
    dspace.party.portal.channel.publish(player.toJSON());
  };
  publishPlayer(localPlayer);
  localPlayer.on('change', publishPlayer);


  /**
   ** VIEWS
   **/

  //// button(s) in top-right corner
  var controls = new ControlsView({ player: localPlayer });

});
