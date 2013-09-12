$(function() {

  var map = new L.Map('map', {
    center: config.map.center,
    zoom: config.map.zoom - 3,
    attributionControl: false
  });
  var basemapCloudmade = new L.TileLayer(config.map.basemap.template, {
    maxZoom : config.map.basemap.maxZoom
  });
  map.addLayer(basemapCloudmade);

  var layerControl = new L.Control.Layers(undefined, undefined, { collapsed: false }).addTo(map);

  /*
    1)   UNDONE Authenticate w/ Persona
    2)   DONE Subscribe to "/bolzano"
    2.1) TODO Get past data from the couch (proxied through the radar).
    3)   IN PROGRESS Display tracks, notes, etc.
    4)   IN PROGRESS Display list of channels (actually users) to turn on / off in the map view
   */

  var users = new UsersCollection();
  var media = new NotesCollection();
  var stream = new Stream({collection: media});

  var faye = new Faye.Client(config.pubsub.url+ '/faye');

  var triage = {
    incoming: function(message, callback) {
      //console.log('incoming', message);
      var md = message.channel.match(/^\/bolzano\/(track|notes|profile)\/([^\/]+)$/);
      if(md) {
        message.data.type = md[1].replace(/s$/,'');
        message.data.id = md[2];
        //console.log('filtered', JSON.stringify(message.data));
      }
      callback(message);
    }
  };
  faye.addExtension(triage);

  // faye -> user/notes/track collections
  var channel = '/bolzano/**';
  faye.subscribe(channel, function(message) {
    if(message.id) {
      var user = users.get(message.id);
      if(! user) {
        user = new WatchedUser({
          id: message.id,
          map: map,
          layerControl: layerControl
        });
        users.add(user);
      }
      // 'record' is a copy of the message, w/o the ID (which identifies the user,
      // not the actual record)
      var record = _.extend({}, message);
      delete record.id;
      if(message.type == 'note') {
        user.notes.add(record);
        // handle media Stream
        if(message.mediaType){
          console.log(record);
          media.add(record);
        }
      } else if(message.type == 'track') {
        user.track.add(record);
      } else if(message.type == 'profile') {
        user.set(record);
      } else {
        console.log("WARNING: unhandled record!", record);
      }
    }
  });

  window.app = {
    users: users
  };
});
