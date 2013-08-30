$(function() {

  //creates a new map
  var map = new L.Map('map', { center: [51.505, -0.09], zoom:1 });

  var basemapCloudmade = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
    maxZoom : 19
  });
  map.addLayer(basemapCloudmade);
  
/*  var basemapGraz = L.tileLayer.wms("http://geodaten1.graz.at/ArcGIS_Graz/services/Extern/LUFTBILD_WMS/MapServer/WMSServer?request=GetCapabilities&service=WMS", {
    layers: 'Orthophoto 2011',
    //format: 'image/png',
    //transparent: true,
    attribution: "OGD Stadt Graz"
  });
*/

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

  map.locate({setView: true, maxZoom: 16});

  function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng, {icon:avatarIcon}).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
  }

  map.on('locationfound', onLocationFound);

  function onLocationError(e) {
    alert(e.message);
  }

  map.on('locationerror', onLocationError);

  var OrthoGraz = new L.AgsDynamicLayer('http://geodaten1.graz.at/ArcGIS_Graz/rest/services/Extern/LUFTBILD_WMS/MapServer', { 
    maxZoom: 19,
    attribution: "OGD Stadt Graz",
    opacity: 1,
    layers: 'show:3' 
  });

/*  var Geoimage = new L.TileLayer.WMS('http://gis.lebensministerium.at/wmsgw/?key=1fa938568d8081db965417cf95e16ea8&', { 
    maxZoom: 19,
    attribution: "Geoimage",
    opacity: 1,
    layers: 'show:' 
  });
*/
  var baseMaps = { 
    //"Geoimage": Geoimage
    'OpenStreetMap':basemapCloudmade,
    "Graz": OrthoGraz,
  };
  
  var overlayMaps = { 
    //'OpenStreetMap':basemapCloudmade 
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);
  L.control.scale({imperial:false}).addTo(map);


});
