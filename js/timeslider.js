$(function() {

  //creates a new map
  var map = new L.Map('map');

  var basemapURL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var basemapLayer = new L.TileLayer(basemapURL, {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
    maxZoom : 19
  });

  // centers map and default zoom level
  map.setView([44.44751, -123.49], 10);

  // adds the background layer to the map
  map.addLayer(basemapLayer);

  // I made playback global so you can call methods on it
  // from the console. You can leave out the second argument
  // if you do not want to preload tracks.
  playback = new L.Playback(map, poiTimeslider);
  var testTrack = L.Polyline([
//  var testTrack = L.MulitPolyline([
    [44.37857221, -123.77252789],
    [44.37788448, -123.81275348],
    [44.36711433, -123.82498006]
  ], {
     color: 'red'
  }).addTo(map);
  

});
