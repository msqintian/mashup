var App = {};
App.config = {
  key: '1cd3ff84f6b2ae618a952f3e6535f195',
  secretToken: 'f06eabdecd60227b',
  user_id: '123736673@N04',
  api: "http://api.flickr.com/services/rest/?method=",
  photoDisplayHost: "https://c2.staticflickr.com/",
};

//constructor
App.Album = function(id, title, description){
  this.id = id;
  this.title = title;
  this.desription = description || title;
  this.$el = $("<div class='album', id='" + id + "'/div>");
  this.$titleEl = $("<div class='title'>Title: <label>" + title + "</label></div>");
  this.$showMapEl = $("<input type='button' value='Show On Map'></input>"); 
  this.$titleEl.append(this.$showMapEl);
  this.$descriptionEl = $("<div class='title'>Description: <label>" + description + "</label></div>"); 
  this.$showMapEl.on('click', function(){
    map.addMarker(description);
  });
};

//class methods
App.Album.showAll = function(data){
  var jsonData = xmlToJson(data);
  var response = jsonData.rsp.photosets;
  var totalAlbums = response['@attributes'].total;
  $('#albumNumber').html(totalAlbums);

  if (totalAlbums > 0){
    for(var i=0; i < totalAlbums; i++){
      var eachAlbum = response.photoset[i];
      var id = eachAlbum['@attributes'].id;
      var description = eachAlbum.description['#text'];
      var title = eachAlbum.title['#text'];

      var album = new App.Album(id, title, description);
      album.show();
    }
  }
};

App.Album.all = function(){
  var method = "flickr.photosets.getList";
  var request = $.ajax({
    type: "GET",
    url: App.config.api + method,
    data: {api_key: App.config.key, user_id: App.config.user_id},
    dataType: 'xml',
  });
  request.then(function(result){
    App.Album.showAll(result);
  });
};

//instance methods
App.Album.prototype.show = function(){
  $('#albumList').append(this.$el);
  this.$el.append(this.$titleEl);
  this.$el.append(this.$descriptionEl);
  this.getPhotos();
};

App.Album.prototype.isValid = function(){
  return (this.title && this.title.length > 0);
};

App.Album.prototype.displayEachPhoto = function(eachPhoto){
  var link = App.config.photoDisplayHost + eachPhoto.farm + "/" + eachPhoto.server + "/" + eachPhoto.id + "_" + eachPhoto.secret + ".jpg"; 
  var photo = new App.Photo(eachPhoto.id, eachPhoto.title, link, this.id);
  photo.show();
};

App.Album.prototype.displayPhotos = function(data){
  var jsonData = xmlToJson(data);
  var response = jsonData.rsp.photoset;
  var totalPhotos = response['@attributes'].total;
  if(totalPhotos > 0){
    var eachPhoto;
    $('#'+this.id).append("<table></table>");
    if(totalPhotos == 1){
      eachPhoto = response.photo['@attributes']; 
      this.displayEachPhoto(eachPhoto);
    }else{
      for(var i=0; i<totalPhotos; i++){
        eachPhoto = response.photo[i]['@attributes']; 
        this.displayEachPhoto(eachPhoto);
      }
    }
  }
};

App.Album.prototype.getPhotos = function(){
  var method = "flickr.photosets.getPhotos";
  var that = this;
  var request = $.ajax({
    type: "GET",
    url: App.config.api + method,
    data: {api_key: App.config.key, photoset_id: this.id},
    dataType: 'xml',
  });
  request.then(function(result){
    that.displayPhotos(result); 
  });
};


App.Photo = function(id, title, link, albumId){
  //https://www.flickr.com/services/api/misc.urls.html
  this.id = id;
  this.title = title;
  this.link = link;
  this.albumId = albumId;
  this.$el = $("<td id='"+ this.id + "'><img src=" + link + ">" + "<div class='center'>" + this.title + "</div></td>");
  this.$el.on('click', this.getGeoLocation.bind(this));
};

//instance methods
App.Photo.prototype.show = function(){
  $('#'+this.albumId+" table").append(this.$el);
};

App.Photo.prototype.showLocations = function(data){
  var jsonData = xmlToJson(data);
  console.dir(jsonData);
};

App.Photo.prototype.getGeoLocation = function(){
  var method = 'flickr.photos.geo.getLocation';
  var that = this;
  var request = $.ajax({
    type: "GET",
    url: App.config.api + method,
    data: {api_key: App.config.key, photo_id: this.id},
    dataType: 'xml',
  });
  request.then(function(result){
    that.showLocations(result); 
  });
};

$(document).ready(function(){
  App.Album.all();
});
