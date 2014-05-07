var GoogleMap = {}, map;
var defaultLat = 40.717079, defaultLng = -73.975167;

//constructor
GoogleMap.Map = function(lat,lng){
  this.lat = lat;
  this.lng = lng;
  var latlng = new google.maps.LatLng(lat, lng);
  var mapOptions = {
    zoom: 8,
    center: latlng
  };
  this.canvas = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
};

//instance methods
GoogleMap.Map.prototype.addMarker = function(address){
  var that = this;
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      that.canvas.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: that.canvas,
          animation: google.maps.Animation.DROP,
          position: results[0].geometry.location
      });
      google.maps.event.addListener(marker, 'mouseover', function(){
        if(!marker.hovered){
          that.showAddress(marker, address);
          marker.hovered = true;
        }
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
};

GoogleMap.Map.prototype.showAddress = function(marker, address){
  var infoWindow = new google.maps.InfoWindow({
    content: "<div id='address'>" + address + "</div>"
  });
  infoWindow.open(this.canvas, marker);
};

GoogleMap.Map.initialize = function() {
  map = new GoogleMap.Map(defaultLat, defaultLng);
};

google.maps.event.addDomListener(window, 'load', GoogleMap.Map.initialize);
