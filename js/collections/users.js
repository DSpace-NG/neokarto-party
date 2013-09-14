var UsersCollection = Backbone.Collection.extend({
  model: WatchedUser,

  initialize: function() {
    this.on('add', function(user){
      var ids = JSON.parse(localStorage.ids);
      var id = user.get('id');
      if(ids.indexOf(id) < 0){
        ids.push(id);
        localStorage.ids = JSON.stringify(ids);
      }
    });
  }
});
