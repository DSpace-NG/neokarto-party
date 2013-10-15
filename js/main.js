$(function() {

  var DSpace = require('dspace-api-core/dspace');
  var LocalOperator = require('dspace-api-core/models/localOperator');
  var StoryOverlay = require('dspace-ui-leaflet/overlays/story');
  var TrackOverlay = require('dspace-ui-leaflet/overlays/track');
  var AvatarOverlay = require('dspace-ui-leaflet/overlays/avatar');

  var config = require('../config');

  var ProfileModal = require('./views/profileModal');
  var ControlsView = require('./views/controls');

  var dspace = new DSpace('elevate');

  //#debug
  window.dspace = dspace;

  // leaflet map
  $('body').append('<div id="map"></div>');
  var map = new L.Map('map', {
    center: config.map.center,
    zoom: config.map.zoom,
    attributionControl: false,
    zoomControl: false
  });

  // add openstreetmap layer
  var basemapCloudmade = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  }).addTo(map);

  var zoomControl = new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

  var operatorsControl = new L.Control.Layers(undefined, undefined, { collapsed: true, position: 'topleft' }).addTo(map);
  $('.leaflet-left .leaflet-control-layers-toggle')[0].classList.add('icon-profile');

  var poisControl = new L.Control.Layers({ "OSM": basemapCloudmade }, undefined, { collapsed: true, position: 'topright' }).addTo(map);
  $('.leaflet-right .leaflet-control-layers-toggle')[0].classList.add('icon-marker');

  var layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  operatorsControl.addOverlay(layerGroup, 'me');

  // we can start using dspace only once ready
  dspace.on('ready', function(){

    console.log('dspace ready!');

    /**
     ** MODELS
     **/
    var operator = new LocalOperator();

    if(!localStorage[operator.profileKey]) {
      operator.set({
        // #attribution: http://www.paulirish.com/2009/random-hex-color-code-snippets/
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        avatar: 'desert'// FIXME no magic values inline please ;)
      }, { silent: true });
      //new ProfileModal( {operator: operator} ); FIXME
    }

    /**
     ** VIEWS
     **/

    // button(s) in top-right corner
    var controls = new ControlsView({ operator: operator });

    var storyOverlay = new StoryOverlay({
      collection: operator.story,
      layer: layerGroup
    });
    var trackOverlay = new TrackOverlay({
      collection: operator.track,
      color: operator.get('color'),
      layer: layerGroup
    });
    var avatarOverlay = new AvatarOverlay({
      model: operator,
      layer: layerGroup
    });

    /**
     ** MAIN
     **/

    // FIXME make possible to switch on/off from UI
    operator.followMe = true;

    // set map viewport when location changes
    // FIXME operator.on('change:position')
    operator.track.on('add', function(location) {
      var latlng = new L.latLng(location.get('lat'), location.get('lng'));
      if(avatarOverlay.avatar) { // position changed.
        if(operator.followMe) {
          map.setView(latlng, config.map.zoom);
        }
      } else { // acquired position for first time.
        map.setView(latlng, config.map.zoom);
      }
    });

    // hook up leaflet's locate() to operator model
    map.on('locationfound', function(mapLocation){
      var location = new Backbone.Model({ 
        lat: mapLocation.latlng.lat,
        lng: mapLocation.latlng.lng
      });
      operator.updateLocation(location);
    });
    map.on('locationerror', function(e) {
      console.error("Failed to acquire position: " + e.message);
    });
    map.locate({
      setView: false,
      watch: true,
      maximumAge: 15000,
      enableHighAccuracy: true
    });

    // initial profile
    operator.trigger('change', operator);

    window.app = {
      operator: operator,
      map: map
    };
  });
});
