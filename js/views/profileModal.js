var ProfileModal = Modal.extend({
  id: 'profile',
  ui: { close: true, submit: true },

  subEvents: {
    'touchstart .avatar': 'selectAvatar',
    'click .avatar': 'selectAvatar',
  },

  initialize: function() {
    _.extend(this.events, this.subEvents);

    this.user = this.options.user;
    this.templateData = this.user.toJSON();
    this.templateData.avatars = this.avatars;
    this.selectedAvatar = this.user.get('avatar');
    this.render();
  },

  selectAvatar: function(event) {
    $('img.avatar').css("border", "2px solid black" );
    event.target.style.border = "2px solid red";
    this.selectedAvatar = event.target.attributes.data.value;
  },

  submit: function(event) {
    var nickname = this.$('input').val();
    var avatar = this.selectedAvatar;

    // if empty nickname don't accept it
    if(nickname === "") return false;

    this.user.set({
      nickname: nickname,
      avatar: avatar
    });

    this.close();
  },

  // create list of avatar objects
  avatars: [
    {file:'agent', name:'Agent'},
    {file:'boss', name:'Skeleton Boss'},
    {file:'clotharmor', name:'Cloth Armor'},
    {file:'coder', name:'Coder'},
    {file:'deathknight', name:'Deatch Knight'},
    {file:'desert', name:'Desert'},
    {file:'firefox', name:'Firefox'},
    {file:'ghost', name:'Ghost'},
    {file:'goldenarmor', name:'Golden Armor'},
    {file:'guard', name:'HTML5 Guard'},
    {file:'king', name:'King'},
    {file:'ninja', name:'Ninja'},
    {file:'priest', name:'Priest'},
    {file:'scientist', name:'Scientist'},
    {file:'skeleton', name:'Skeleton'},
    {file:'villager', name:'Villager'},
    {file:'zombie', name:'Zombie'}
  ],

});
