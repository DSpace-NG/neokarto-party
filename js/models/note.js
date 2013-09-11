var Note = Backbone.Model.extend({
  initialize: function() {
    this.set('uuid', uuid());
    this.set('timeStart', new Date().getTime());
  },

  attachFile: function(file) {

  },

  // for now we use for marker location where note got submited
  markerLocation: function() {
    return this.get('locationSubmit');
  }
});
