var key = '1cd3ff84f6b2ae618a952f3e6535f195';
var secretToken = 'f06eabdecd60227b';
var user_id = '123736673@N04';
var apiHost = "http://api.flickr.com/services/rest/?method=";
var photoDisplayHost = "https://c2.staticflickr.com/";

function showAlerts(method){
  alert("There is an error when calling method " + method);
}

var Album = function(id, title, description){
  this.id = id;
  this.title = title;
  this.description = description || title;
  this.$el = $("<div class='album', id='" + id + "'/div>");
  this.$titleEl = $("<div class='title'>Title: <label>" + title + "</label></div>");
  this.$descriptionEl = $("<div class='title'>Description: <label>" + description + "</label></div>"); 
};

//class methods
Album.showAll = function(data){
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

      var album = new Album(id, title, description);
      album.showOnMap();
    }
  }

};

Album.all = function(){
  var method = "flickr.photosets.getList";
  var request = $.ajax({
    type: "GET",
    url: apiHost + method,
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
      url: apiHost + method,
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

Album.prototype.showPhotos = function(data,marker){
  function displayEachPhoto(eachPhoto, albumId){
    var link = photoDisplayHost + eachPhoto.farm + "/" + eachPhoto.server + "/" + eachPhoto.id + "_" + eachPhoto.secret + ".jpg"; 
    var photo = new Photo(eachPhoto.id, eachPhoto.title, link, albumId);
    return photo.el;
  }
  var jsonData = xmlToJson(data);
  var response = jsonData.rsp.photoset;
  var totalPhotos = response['@attributes'].total;
  var photoEls = "";
  if(totalPhotos > 0){
    var eachPhoto;
    if(totalPhotos == 1){
      eachPhoto = response.photo['@attributes']; 
      photoEls += displayEachPhoto(eachPhoto, this.id);
    }else{
      for(var i=0; i<totalPhotos; i++){
        eachPhoto = response.photo[i]['@attributes']; 
        photoEls += displayEachPhoto(eachPhoto, this.id);
      }
    }
  }
  var infoWindow = new google.maps.InfoWindow({
    content: "<div class='title' id=" + this.id + ">" + this.title + "</div>" 
      + photoEls,
    maxWidth: 400
  });
  infoWindow.open(map,marker);
};

Album.prototype.showOnMap = function(){
  var that = this;
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': this.description}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: results[0].geometry.location
      });
      google.maps.event.addListener(marker, 'mouseover', function(){
        if($("#"+that.id).length === 0){
          var request = that.getPhotos();
          request.then(function(data){
            that.showPhotos(data,marker);
          });
        }
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
};

Album.prototype.isValid = function(){
  return (this.title && this.title.length > 0);
};

Album.prototype.addPhotos = function(){
};

Album.prototype.getPhotos = function(){
  var method = "flickr.photosets.getPhotos";
  var that = this;
  var request = $.ajax({
    type: "GET",
    url: apiHost + method,
    data: {api_key: key, photoset_id: this.id},
    dataType: 'xml',
  });
  return request;
};


var Photo = function(id, title, link, albumId){
  //https://www.flickr.com/services/api/misc.urls.html
  this.id = id;
  this.title = title;
  this.link = link;
  this.albumId = albumId;
  this.el = "<a href=" + link + " target='_blank'><img id=" + this.id + " src=" + link + "></a>"
  + "<div class='center'>" + this.title + "</div>";
};

Photo.prototype.create = function(){
};

$(document).ready(function(){
  Album.all();
});
