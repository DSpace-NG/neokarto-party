// FIXME
var PixelIcon = L.Icon.extend({
  options: {
    iconSize:     [48, 48],
    iconAnchor:   [24, 48],
    popupAnchor:  [-3, -76]
  }
});

$(function() {
  var map = new L.Map('map', {
    center: config.map.center, 
    zoom: config.map.zoom, 
    attributionControl: false
  });
  var basemapCloudmade = new L.TileLayer(config.map.basemap, {
    maxZoom : 19
  });
  map.addLayer(basemapCloudmade);
  L.control.scale({imperial:false}).addTo(map);
  var layerControl = new L.Control.Layers(undefined, undefined, { collapsed: false }).addTo(map);

  /*
    1)   DONE Authenticate w/ Persona
    2)   DONE Subscribe to "/bolzano"
    2.1) TODO Get past data from the couch (proxied through the radar).
    3)   IN PROGRESS Display tracks, notes, etc.
    4)   DONE Display list of channels (actually users) to turn on / off in the map view
    5)   TODO Rule the world.
   */

  // a <user-id> -> <polyline> map
  var lines = {};
  var markers = {};
  var layerGroups = {};

  function subscribe(channel) {
    var faye = new Faye.Client(config.pubsub.url+ '/faye');

    faye.addExtension({
      incoming: function(message, callback) {
        console.log('incoming', message);
        var md = message.channel.match(/^\/bolzano\/(track|notes|profile)\/([^\/]+)$/);
        if(md) {
          message.data.type = md[1].replace(/s$/,'');
          message.data.id = md[2];
          console.log('filtered', JSON.stringify(message.data));
        }
        callback(message);
      }
    });

    var users = new UsersCollection();

    var overlays = {};

    // new user, add overlays.
    users.on('add', function(user) {
      overlays[user.id] = {
        notes: new NotesOverlay({
          map: map,
          collection: user.notes
        }),
        track: new TrackOverlay({
          map: map,
          user: user,
          collection: user.track
        })
      };
    });


    // faye -> user/notes/track collections
    faye.subscribe(channel, function(message) {
      if(message.id) {
        var user = users.get(message.id);
        if(! user) {
          user = new WatchedUser({
            id: message.id
          });
          users.add(user);
        }
        // 'record' is a copy of the message, w/o the ID (which identifies the user,
        // not the actual record)
        var record = _.extend({}, message);
        delete record.id;
        if(message.type == 'note') {
          user.notes.add(record);
        } else if(message.type == 'track') {
          user.track.add(record);
        } else if(message.type == 'profile') {
          user.set(record);
        } else {
          console.log("WARNING: unhandled record!", record);
        }
      }
    });

  }

  //     var layerGroup;
  //     if(message.id) {
  //       layerGroup = layerGroups[message.id];
  //       if(! layerGroup) {
  //         layerGroup = new L.LayerGroup();
  //         layerGroups[message.id] = layerGroup;
  //         layerControl.addOverlay(layerGroup, message.id);
  //       }
  //     }


  var channel = '/bolzano/**';
  subscribe(channel);

  window.app = {
    map: map,
    lines: lines,
    markers: markers
  };

});
