$(function() {

  var UUID = require('node-uuid');
  var config = require('../config');

  // API CORE
  var DSpace = require('dspace-api-core');
  var LocalPlayer = require('dspace-api-core/models/localPlayer');
  var Places = require('dspace-api-core/collections/places');
  var Pois = require('dspace-api-core/collections/pois');

  // API Bayeux
  var BayeuxHub = require('dspace-api-bayeux/hub');

  // UI Leaflet
  var Roster = require('dspace-ui-leaflet/roster');
  var Map = require('dspace-ui-leaflet/map');
  var PlacesOverlay = require('dspace-ui-leaflet/overlays/places');
  var PoisOverlay = require('dspace-ui-leaflet/overlays/pois');

  // local
  var AccountModal = require('./views/accountModal');
  var ProfileModal = require('./views/profileModal');
  var ControlsView = require('./views/controls');
  var ActionsView = require('./views/actions');

  var request = require('superagent');

  var mapOptions = {};
  if(localStorage.map_options) {
    mapOptions = JSON.parse(localStorage.map_options);
  } else {
    localStorage.map_options = JSON.stringify(mapOptions);
  }
  if(mapOptions.center) config.map.center = mapOptions.center;
  if(mapOptions.zoom) config.map.zoom = mapOptions.zoom;

  var init = function(profile){

    config.player.profile = profile;

    $('body').append('<div id="' + config.map.elementId + '"></div>');
    var m = new Map({config: config.map});

    var dspace = new DSpace(m, Roster, BayeuxHub, config);

    var localPlayer = new LocalPlayer(profile, {
      settings: config.settings,
      nexus: dspace.nexus
    });

    localPlayer.on('change', function(player){
      localStorage.profile = JSON.stringify(player);
    });

    var layerGroup = new L.LayerGroup();
    layerGroup.addTo(dspace.map.frame);
    dspace.roster.createPlayerOverlays(localPlayer, { avatar: layerGroup, track: layerGroup });

    dspace.player = localPlayer;

    // PLAY!
    var publishPlayer = function(player){
      dspace.party.portal.channel.pub(player);
    };
    publishPlayer(localPlayer);
    localPlayer.on('change', publishPlayer);


    /**
     ** VIEWS
     **/

    var map = dspace.map.frame;

    center = map.getCenter();
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
      //console.log(poiset.url);
      //poiset.url = poiset.url + map.getBounds().toBBoxString();
      var places = new Places([], {
        config: poiset,
        nexus: dspace.nexus
      });
      new PlacesOverlay({
        collection: places,
        config: poiset,
        map: map
      });
      map.poisControl.addOverlay(places.overlay.layer, poiset.name);
      POIOverlays.push(places.overlay);
    });


    var PoiSearch = L.Control.extend({

      initialize: function() {
        this.overlay = new PoisOverlay({
          collection: new Pois(),
          map: map});
        map.addLayer(this.overlay.layer, "Search Results");
        POIOverlays.push(this.overlay);
        this.query = null;
        this.pending_request = null;
      },

      options: {
        position: "bottomright",
      },

      search: function(query) {
        this.query = query;
        this.updatePois();
      },

      // TODO: update only new parts of map (poly)
      updatePois: function() {
        if(!this.query) { return; }
        var bounds = map.getBounds();
        var bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(",");
        var query = '[out:json];(node';

        if(this.query && this.query.length > 0) {
          this.query.split(" ").map(function(e) {
            var t = e.split("=");
            if(t.length == 1) {
              query += '["name"~"' + t[0] + '"]';
            } else {
              query += '["' + t[0] + '"="' + t[1] + '"]';
            }
          });
        } else {
          return;
        }

        query += '(' + bbox + '););out qt;';

        this.queryPois(query, function(pois) {
          console.log(pois);
          this.overlay.reset(pois);
        }.bind(this));
      },

      queryPois: function(query_str, cb) {
        if(this.pending_request) {
          this.pending_request.xhr.abort();
        }
        console.log(query_str);
        this.pending_request = request
          .get("http://overpass.osm.rambler.ru/cgi/interpreter")
          .set("Accept", "*/*")
          .query({"data": query_str})
          .end(function(res) {
            cb(res.body.elements);
          }.bind(this));
      },

      onAdd: function(map) {
        var container = L.DomUtil.create('div', 'poi_search');
        container.innerHTML = "<form id='poi_search' action='' method='get'><input name='name' type='text' value='railway=station' /><input type='submit' value='>'/></form>";
        return container;
      },
    });

    var poi_search = new PoiSearch();
    map.addControl(poi_search);
    var poi_search_elem = document.getElementById("poi_search");
    poi_search_elem.onsubmit = function() {
      name = poi_search_elem.children[name='name'].value;
      try {
        poi_search.search(name);
      } catch(e) {
        console.log(e);
      }
      return false;
    }.bind(this);

    // FIXME only for visible layers?
    map.on('zoomend', function(){
      _.each(POIOverlays, function(overlay){
        overlay.scaleMarkers();
      });
      mapOptions.zoom = map.getZoom();
      localStorage.map_options = JSON.stringify(mapOptions);
    });

    map.focus = new L.Marker(map.getCenter(), {
      icon: new L.Icon({
        iconUrl: config.settings.icons.focus.url,
        iconSize: [48, 48]
      })
    });

    map.on('click', function(){
      map.removeLayer(map.focus);
      controls.show();
      actions.hide();
    });

    map.focus.on('click', function(){
      map.removeLayer(map.focus);
      controls.show();
      actions.hide();
    });

    map.on('moveend', function(event){
      center = map.getCenter();
      mapOptions.center = [center.lat, center.lng];
      localStorage.map_options = JSON.stringify(mapOptions);
      poi_search.updatePois();
    }.bind(this));

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

    //#debug
    window.dspace = dspace;
    dspace.devChan = dspace.nexus.getChannel({ url: config.party.portal.channel.url, path: '/dev' });
    dspace.devChan.sub(function(message){
      if(message.player && message.player.uuid === dspace.player.get('uuid')) return;
      switch(message.command){
        case 'RELOAD':
          window.location.reload();
          break;
        case 'STORAGE:CLEAR':
          localStorage.clear();
          window.location.reload();
          break;
        case 'ALERT':
          alert(message.alert);
          break;
      }
    });
  };

  var profile;
  if(localStorage.profile) {
    profile = JSON.parse(localStorage.profile);
    init(profile);
  } else {
    uuid =  UUID();
    profile = { uuid: uuid};
    profile.avatar = config.player.avatar;
    profile.color = '#' + Math.floor(Math.random()*16777215).toString(16);

    var newPlayer = new Backbone.Model(profile);
    newPlayer.once('change:track', function(player){
      player.once('change:nickname', function(player){
        localStorage.profile = JSON.stringify(player);
        init(player.toJSON());
      });
      new ProfileModal({ player: player });
    });
    new AccountModal({ player: newPlayer });
  }
});
