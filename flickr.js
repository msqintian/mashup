var key = '1cd3ff84f6b2ae618a952f3e6535f195';
var secretToken = 'f06eabdecd60227b';
var user_id = '123736673@N04';
var api = "http://api.flickr.com/services/rest/?method=";
var photoDisplay = "https://c2.staticflickr.com/";

function showAlerts(method){
  alert("There is an error when calling method " + method);
}

var Album = function(id, title, description){
  this.id = id;
  this.title = title;
  this.desription = description || title;
  this.$el = $("<div class='album', id='" + id + "'/div>");
  this.$titleEl = $("<div class='title'>Title: <label>" + title + "</label></div>");
  this.$showMap = $("<input type='button' value='Show On Map'></input>"); 
  this.$titleEl.append(this.$showMap);
  this.$descriptionEl = $("<div class='title'>Description: <label>" + description + "</label></div>"); 
  this.$showMap.on('click', function(){
    codeAddress(description);
  });
};

//class methods
Album.showAll = function(data){
  var jsonData = xmlToJson(data);
  var response = jsonData.rsp.photosets
  var totalAlbums = response['@attributes'].total;
  $('#albumNumber').html(totalAlbums);

  if (totalAlbums > 0){
    for(var i=0; i < totalAlbums; i++){
      var eachAlbum = response.photoset[i];
      var id = eachAlbum['@attributes'].id;
      var description = eachAlbum.description['#text']
      var title = eachAlbum.title['#text']

      var album = new Album(id, title, description);
      $('#albumList').append(album.$el);
      $(album.$el).append(album.$titleEl);
      $(album.$el).append(album.$descriptionEl);
      album.getPhotos();
    }
  }

};

Album.all = function(){
  var method = "flickr.photosets.getList";
  var request = $.ajax({
    type: "GET",
    url: api + method,
    data: {api_key: key, user_id: user_id},
    dataType: 'xml',
  });
  request.then(function(result){
    Album.showAll(result);
  });
};

Album.create = function(title, description){
  var album = new Album(title, description);
  if(album.isValid){
    var method = "flickr.photosets.create";
    var request = $.ajax({
      type: "POST",
      url: api + method,
      data: {api_key: key, title: title, description: description},
      dataType: 'xml',
    });
    request.then(function(result){
      Album.showOnMap(result);
    });
  }else{
    alert("Please type in title and description!");
  }

};

Album.prototype.isValid = function(){
  return (this.title && this.title.length > 0);
};

Album.prototype.addPhotos = function(){
};

Album.prototype.displayPhotos = function(data){
  function displayEachPhoto(eachPhoto, albumId){
    var link = photoDisplay + eachPhoto.farm + "/" + eachPhoto.server + "/" + eachPhoto.id + "_" + eachPhoto.secret + ".jpg"; 
    var photo = new Photo(eachPhoto.id, eachPhoto.title, link, albumId);
    photo.show();
  }
  var jsonData = xmlToJson(data);
  var response = jsonData.rsp.photoset;
  var totalPhotos = response['@attributes'].total;
  if(totalPhotos > 0){
    $('#'+this.id).append("<table></table>");
    if(totalPhotos == 1){
      var eachPhoto = response.photo['@attributes']; 
      displayEachPhoto(eachPhoto, this.id);
    }else{
      for(var i=0; i<totalPhotos; i++){
        var eachPhoto = response.photo[i]['@attributes']; 
        displayEachPhoto(eachPhoto, this.id);
      }
    }
  }
};

Album.prototype.getPhotos = function(){
  var method = "flickr.photosets.getPhotos";
  var that = this;
  var request = $.ajax({
    type: "GET",
    url: api + method,
    data: {api_key: key, photoset_id: this.id},
    dataType: 'xml',
  });
  request.then(function(result){
    that.displayPhotos(result); 
  });
};


var Photo = function(id, title, link, albumId){
  //https://www.flickr.com/services/api/misc.urls.html
  this.id = id;
  this.title = title;
  this.link = link;
  this.albumId = albumId;
  this.$el = $("<td id='"+ this.id + "'><img src=" + link + ">" + "<div class='center'>" + this.title + "</div></td>");
  this.$el.on('click', this.getGeoLocation.bind(this));
};

//class methods
Photo.findByAlbumName = function(albumName){
};

Photo.findById = function(id){
};

Photo.prototype.create = function(){
};

Photo.prototype.show = function(){
  $('#'+this.albumId+" table").append(this.$el);
};

Photo.prototype.showLocations = function(data){
  var jsonData = xmlToJson(data);
  console.dir(jsonData);
}

Photo.prototype.getGeoLocation = function(){
  var method = 'flickr.photos.geo.getLocation';
  var that = this;
  var request = $.ajax({
    type: "GET",
    url: api + method,
    data: {api_key: key, photo_id: this.id},
    dataType: 'xml',
  });
  request.then(function(result){
    that.showLocations(result); 
  });

}

$(document).ready(function(){
  Album.all();
});
