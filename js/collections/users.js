var UsersCollection = Backbone.Collection.extend({
  model: WatchedUser,

  initialize: function() {
    this.on('add', function(user){
      var ids = JSON.parse(localStorage.ids);
      var uuid = user.get('uuid');
      if(ids.indexOf(uuid) < 0){
        ids.push(uuid);
        localStorage.ids = JSON.stringify(ids);
      }
    });
  }
});
