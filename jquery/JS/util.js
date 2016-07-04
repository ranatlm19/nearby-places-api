function divideWeekdayScheduleText(text) {
  var result = {};
  var array = [];
  array = text.split(': ');
  result.day = array[0];
  result.sched = array[1];
  return result;
}

function createListElement(place, distance) {
  var htmlContent = "";
  // htmlContent += '<a href="#" class="elementLink" onclick="event.preventDefault()">';
  htmlContent += '<li class="search-element">';
  htmlContent += '<div class="elementHeader">';
  htmlContent += '<div class="title"> <span class="title-span">' + place.name + '</span> ';
  if(place.rating) {
    htmlContent += '<span class="rating-span">Rating - ' + place.rating + '</span>';
  }
  htmlContent += '</div>';
  htmlContent += '</div>';
  htmlContent += '<div class="elementBody">';
  htmlContent += '<div class="address">';
  htmlContent += place.vicinity;
  htmlContent += '</div>';
  htmlContent += '<div class="distance">' + distance + '</div>';
  htmlContent += '</div>';
  htmlContent += '</li>';
  // htmlContent += '</a>';

  return htmlContent;
}

function createNewMarker(map, place) {
  // var image = createPlaceImage(place);
  var marker = new google.maps.Marker({
    map: map,
    // icon: image,
    title: place.name,
    position: place.geometry.location
  });
  return marker;
}

// function createPlaceImage(place) {
//   var image = {
//     url: place.icon,
//     size: new google.maps.Size(71, 71),
//     origin: new google.maps.Point(0, 0),
//     anchor: new google.maps.Point(17, 34),
//     scaledSize: new google.maps.Size(25, 25)
//   };
//   return image;
// }

function getLocations(places) {
  var i;
  var elem, placeLocation, lat, lng;
  var locations = [];
  for(i=0;i<places.length;i++) {
    placeLocation = places[i].geometry.location;
    lat = placeLocation.lat();
    lng = placeLocation.lng();
    locations.push(new google.maps.LatLng({lat: lat, lng: lng}));
  }
  return locations;
}

function getPlaceIDs(places) {
  var i;
  var place_ids = []
  for(i=0;i<places.length;i++) {
    place_ids.push(places[i].place_id);
  }
  return place_ids;
}
