neokarto-party
==============

Neokarto Party is a HTML5 Web App created for a [neogeographic](https://en.wikipedia.org/wiki/Neogeography) Mapping Party at the [Transart Festival](http://transart.it/) in Bozen on September the 14th. It collects notes, imates and geolocations from users mobile devices. The data is stored inside CouchDB and can be presented in realtime and as timeframe playback afterwards.

The software is licensed under the [Public Domain](http://unlicense.org/)

## DEPENDENCIES
### Client
- [Mozilla Persona Authentification](https://www.persona.org/)
- [jQuery](http://jquery.com/)
- [jQuery UI](http://jqueryui.com/)
- [Leaflet](http://leafletjs.com/)
	- [Leaflet Plugin: Awesome Markers]()
		- [Font Awesome](http://fortawesome.github.io/Font-Awesome/)
	- [Leaflet Plugin: LeafletPlayback](https://github.com/hallahan/LeafletPlayback)
		- [Bootstrap](http://getbootstrap.com/)
		- [Bootstrap Timepicker](http://jdewit.github.io/bootstrap-timepicker/)
- faye-client
- [fontello](http://fontello.com)

### Server
it expects this server running on localhost:
https://github.com/elevate-festival/dspace-bayeux-server

### Config

    $ cp config.js.example config.js

## INSTALL INSTRUCTIONS

### Development
bower is a package manager for frontend libraries.
```shell
npm install -g bower
bower install
```

Grunt is a task runner. Together with the Gruntfile.js it is configured to automatically update the browser on every save you make on your development files for easier development. To install it type this in your shell:
```shell
npm install -g grunt-cli
npm install
grunt
```

### Server



## CHANGELOG



<!--
# Presentation
- Heatmap
- Timeslider
- Headquarter


# todo
- copyright issues avatars
- documentation
- add PubSub
-->

