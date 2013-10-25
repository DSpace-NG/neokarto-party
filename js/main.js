$(function() {

  var URL = require('url');
  var UUID = require('node-uuid');
  Backbone.VirtualCollection = require('backbone-virtual-collection');

  var config = require('../config');

  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var RemotePlayer = require('dspace-api-core/models/remotePlayer');
  var Places = require('dspace-api-core/collections/places');

  var BayeuxHub = require('dspace-api-bayeux/hub');
  var HTTPHub = require('dspace-api-core/hubs/http');

  //var StoryOverlay = require('dspace-ui-leaflet/overlays/story');
  var TrackOverlay = require('dspace-ui-leaflet/overlays/track');
  var AvatarOverlay = require('dspace-ui-leaflet/overlays/avatar');
  var PlacesOverlay = require('dspace-ui-leaflet/overlays/places');


  var ProfileModal = require('./views/profileModal');
  var ControlsView = require('./views/controls');
  var ActionsView = require('./views/actions');

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

  var zoomControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);

  var poisControl = new L.Control.Layers({ "OpenStreetMap": basemap }, undefined, { collapsed: true, position: 'topleft' }).addTo(map);

  /**
   ** MODELS
   **/
  var Portal = function(config, nexus){

    _.extend(this, Backbone.Events);

    this.feed = nexus.getFeed(config.feed);
    this.feed.pull(function(roster){
      // ignore localPlayer
      _.remove(roster, function(player){ return player.uuid === localStorage.uuid; } );
      this.trigger('roster', roster);
    }.bind(this));

    this.channel = nexus.getChannel(config.channel);
    this.channel.sub(function(message){
      // ignore localPlayer
      if(message.uuid !== localStorage.uuid){
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
        this.set(roster, { nexus: this.nexus });
      }.bind(this));

      this.portal.on('player', function(player){
        if(this.get(player.uuid)){
          this.get(player.uuid).set(player);
        } else {
          this.add(player, { nexus: this.nexus });
        }
      }.bind(this));
    }
  });

  var Nexus = function(config){
    // keeps track on hubs to prevening creating duplicates when requiesting channels
    this.hubs = {};

    this.getFeed = function(template){
      if(_.isString(template)){
        var parts = URL.parse(template);
        template = {
          url: parts.protocol + '//' + parts.host,
          path: parts.path
        };
      }
      var protocol = template.protocol;
      if(!protocol) protocol = 'http';
      var hub;
      if(this.hubs[protocol]){
        hub = this.hubs[protocol][template.url];
      } else {
        this.hubs[protocol] = {};
      }
      if(!hub){
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

    this.nexus = new Nexus(config);

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

  var profile;
  if(localStorage.profile) {
    profile = JSON.parse(localStorage.profile);
  } else {
    uuid =  UUID();
    profile = { uuid: uuid};
    profile.track = {
      channel: { url: 'http://192.168.11.101:5000/bayeux'},
      feed: { url: 'http://192.168.11.101:5000'}
    };
    profile.track.channel.path =  '/' + uuid + '/track';
    profile.track.feed.path =  '/' + uuid + '/track';
    profile.color = dspace.utils.randomColor();
  }


  var localPlayer = new LocalPlayer(profile, {
    settings: config.settings,
    nexus: dspace.nexus
  });

  if(!localPlayer.get('nickname')) {
    new ProfileModal( { player: localPlayer } );
  }

  localPlayer.on('change', function(player){
    localStorage.profile = JSON.stringify(player);
  });


  var layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  dspace.roster.createPlayerOverlays(localPlayer, { avatar: layerGroup, track: layerGroup });

  dspace.player = localPlayer;
  //var storyOverlay = new StoryOverlay({
  //collection: localPlayer.story,
  //layer: layerGroup
  //});


  // PLAY!
  var publishPlayer = function(player){
    dspace.party.portal.channel.pub(player);
  };
  publishPlayer(localPlayer);
  localPlayer.on('change', publishPlayer);


  /**
   ** VIEWS
   **/

  //// button(s) in top-right corner
  var controls = new ControlsView({
    player: localPlayer,
    map: map
  });

  var actions = new ActionsView({});

  /*
   * POIs
   */
  var POIOverlays = [];
  dspace.POIOverlays = POIOverlays;
  _.forEach(config.poisets, function(poiset){
    var places = new Places([], {
      config: poiset,
      nexus: dspace.nexus
    });
    new PlacesOverlay({
      collection: places,
      config: poiset,
      map: map
    });
    poisControl.addOverlay(places.overlay.layer, poiset.name);
    POIOverlays.push(places.overlay);
  });

  // FIXME only for visible layers?
  map.on('zoomend', function(){
    _.each(POIOverlays, function(overlay){
      overlay.scaleMarkers();
    });
  });

  map.focus = new L.Marker(map.getCenter(), {
    icon: new L.Icon({
      iconUrl: config.settings.icons.focus.url,
      iconSize: [48, 48]
    })
  });

  map.on('click', function(){
    map.removeLayer(map.focus);
  });

  map.focus.on('click', function(){
    map.removeLayer(map.focus);
    controls.show();
    actions.hide();
  });

  map.on('contextmenu', function(event){
    map.focus.setLatLng(event.latlng);
    map.addLayer(map.focus);
    controls.hide();
    actions.show();
  });

  //FIXME don't depend on popup
  map.on('popupopen', function(event){
    map.removeLayer(map.focus);
    controls.hide();
    actions.show();
  });

  this.controls = controls;

  //FIXME don't depend on popup
  map.on('popupclose', function(event){
    controls.show();
    actions.hide();
  });

  localPlayer.on('selected', function(player){
    console.log('selected localPlayer', player);
  });

  $('.leaflet-left .leaflet-control-layers-toggle')[0].classList.add('icon-marker');
  $('.leaflet-left .leaflet-control-layers-toggle')[1].classList.add('icon-profile');

});
