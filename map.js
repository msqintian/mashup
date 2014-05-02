var map;
var Map = function(){};

Map.initialize = function(){
  var latlng = new google.maps.LatLng(40.717079, -73.975167);
  var mapOptions = {
    zoom: 8,
    center: latlng
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  google.maps.event.addListener(map, 'click', function(e) {
      Map.placeMarker(e.latLng, map);})
};

Map.placeMarker = function(position, map) {
  var marker = new google.maps.Marker({
    position: position,
    map: map
  });
  google.maps.event.addListener(marker, 'click', function(){
    marker.setMap(null); //clear marker from map 
  });
  
  map.panTo(position);
  Map.findAddress(position, function(address){
    var infoWindow = new google.maps.InfoWindow({
      content: "<div class='address'>" + address + "</div><div><a href='#create-album'>Create Album</a></div>"
    });
    infoWindow.open(map,marker);
    $('#create-album').on("click", function(){
      console.log("create album");
    });
  });
};

Map.findAddress = function(position, callback){
  var geocoder = new google.maps.Geocoder();
  var request = geocoder.geocode({'latLng': position}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        callback(results[1].formatted_address);
      } else {
        alert('No results found');
      }
    } else {
      alert('Geocoder failed due to: ' + status);
    }
  });
};

google.maps.event.addDomListener(window, 'load', Map.initialize);
