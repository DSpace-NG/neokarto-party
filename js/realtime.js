$(function() {

  //creates a new map
  var map = new L.Map('map', { center: [51.505, -0.09], zoom:1 });

  var basemapCloudmade = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
    maxZoom : 19
  });
  map.addLayer(basemapCloudmade);
  
  /*var basemapGraz = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
    layers: 'nexrad-n0r-900913',
    format: 'image/png',
    transparent: true,
    attribution: "OGD Stadt Graz"
  });*/

  var baseMaps = { 
    //'Graz':basemapGraz,
    'OpenStreetMap':basemapCloudmade
  };
  
  var overlayMaps = { 
    //'OpenStreetMap':basemapCloudmade 
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // centers map and default zoom level
  map.setView([44.44751, -123.49], 10);

  // adds the background layer to the map
  //map.addLayer(basemapLayer);

  //L.geoJSON(poiRealtime).addTo(map);  

  var avatar = 'scientist';
  var avatarURL = 'assets/images/'+ avatar +'.png';

  var PixelIcon = L.Icon.extend({
    options: {
        iconSize:     [48, 48],
        iconAnchor:   [24, 48],
        popupAnchor:  [-3, -76]
    }
  });

  var avatarIcon = new PixelIcon({iconUrl: avatarURL});

  for(i=0; i<poiRealtime.length; i++){
    L.marker([ poiRealtime[i].geometry.coordinates[0][1], poiRealtime[i].geometry.coordinates[0][0] ], {
      icon : avatarIcon
    }).addTo(map);
  }

  /*var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

  L.geoJson(poiRealtime, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  }).addTo(map);*/

  L.control.scale({imperial:false}).addTo(map);

});
