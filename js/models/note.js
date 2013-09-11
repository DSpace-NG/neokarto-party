var Note = Backbone.Model.extend({
  initialize: function() {
    this.set('@type', 'note');
    this.set('uuid', uuid());
    this.set('timeStart', new Date().getTime());
  },

  /*
   * pictures: 'image/*'
   * videos: 'video/*'
   * audio rec: 'video/3gpp'
   *
   * used to attach media files to notes
   * #attribution http://blog.w3villa.com/websites/uploading-filesimage-with-ajax-jquery-without-submitting-a-form/
   */
  attachFile: function(file) {
    this.set('mediaType', file.type);
    var formData = new FormData();
    var metadata = { noteUUID: this.get('uuid') };
    formData.append('file', file);
    formData.append('meta', JSON.stringify(metadata));
    $.ajax({
      url: config.pubsub.url + '/upload',
      data: formData,
      type: 'post',
      contentType: false,
      processData: false
    });
  },

  // for now we use for marker location where note got submited
  markerLocation: function() {
    return this.get('locationSubmit');
  }
});
