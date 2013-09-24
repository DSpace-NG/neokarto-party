neokarto-party
==============

Neokarto Party is a HTML5 Web App created for a [neogeographic](https://en.wikipedia.org/wiki/Neogeography) Mapping Party at the [Transart Festival](http://transart.it/) in Bozen on September the 14th. It collects notes, imates and geolocations from users mobile devices. The data is stored inside CouchDB and can be presented in realtime and as timeframe playback afterwards.

The software is licensed under the [Public Domain](http://unlicense.org/)

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

### Config

    $ cp config.js.example config.js


## DEPENDENCIES

### Client
- [Leaflet](http://leafletjs.com/)
- [Faye]()
- [fontello](http://fontello.com)

### Server
it expects this server running on localhost:
https://github.com/elevate-festival/dspace-bayeux-server


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

