
var User = Backbone.Model.extend({

  initialize: function() {
    _.bindAll(this, 'setLocation');
    if(localStorage['neokarto:user:id']) {
      this.id = localStorage['neokarto:user:id'];
    } else {
      this.id = Math.uuid();
      localStorage['neokarto:user:id'] = this.id;
    }
    this.notes = new NotesCollection();
  },

  setLocation: function(location) {
    if(this.location && this.location.lat == location.latlng.lat && this.location.lng == location.latlng.lng) {
      // location didn't actually change.
      return;
    }
    this.location = location.latlng;
    this.location.accuracy = location.accuracy;
    this.trigger('location-changed', this.location);
  },

});
