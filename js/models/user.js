
var User = Backbone.Model.extend({

  initialize: function() {
    this.setLocation = this.setLocation.bind(this);
  },

  setLocation: function(location) {
    if(this.location && this.location.latlng.lat == location.latlng.lat && this.location.latlng.lng == location.latlng.lng) {
      // location didn't actually change.
      return;
    }
    this.location = location;
    this.trigger('location-changed', location);
  }

});