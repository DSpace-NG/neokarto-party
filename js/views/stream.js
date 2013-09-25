var config = require('../../config');
var Capture = require('../models/capture');

var Stream  = Backbone.View.extend({
  el: "#stream",

  initialize: function() {
    _.bindAll(this, 'addMedia');
    this.collection.on('add', this.addMedia);
  },

  addMedia: function(capture){
    var html = '<img src="' + config.media.url + capture.get('uuid') + '" />';
    setTimeout(function() {
      this.$el.append(html);
    }.bind(this), 30000);
  }

});

module.exports = Stream;
