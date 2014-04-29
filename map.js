var map;
function initialize() {
  var latlng = new google.maps.LatLng(40.717079, -73.975167);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function codeAddress(address) {
  function showAddress(marker){
    var infoWindow = new google.maps.InfoWindow({
      content: "<div id='address'>" + address + "</div>"
    });
    infoWindow.open(map,marker);
  }

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
      google.maps.event.addListener(marker, 'mouseover', function(){
        showAddress(marker);
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
