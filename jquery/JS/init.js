// Map variable
var map;

// Default location set to Practo technologies location
var userLocation = {
  lat: 12.798314,
  lng: 77.594545
};

var userLocationMarker = null;        // Marker for user location
var markedPlaces = null;              // Array for marked places
var lastOpenInfoWindow = null;        // Stores the last open info window
var destinationDistanceMatrix = null;    // Stores Distance matrix
var places = null;              // Stores all the destination places
var isMobile = false;

function initMap() {

  var mapDiv = document.getElementById('map');
  var userAgent = navigator.userAgent;

    // Checking if the User device is an iPhone or Android and setting map size accordingly
    if (userAgent.indexOf('iPhone') != -1 || userAgent.indexOf('Android') != -1 ) {
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      $('#map').css('min-height','0px');
      $('#map').css('min-width','0px');
      isMobile = true;
    }
    
    // Rendering the map
    map = new google.maps.Map(document.getElementById('map'), {
      center: userLocation,
      zoom: 12
    });

    // Mapping user location
    createUserLocationMarker();

    // If geolocation is enabled, getting the current location of user and updating the center of the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        userLocation.lat=position.coords.latitude;
        userLocation.lng=position.coords.longitude;
        map.setCenter(new google.maps.LatLng(userLocation.lat, userLocation.lng));
        createUserLocationMarker();
      });
    }
  }

  function createUserLocationMarker() {
    if(userLocationMarker != null) {
      userLocationMarker.setMap(null);
    }
    var image = {
      url: '../jquery/img/currentLocation.png',
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    userLocationMarker = new google.maps.Marker({
      map: map,
      icon: image,
      position:{lat: userLocation.lat, lng: userLocation.lng}
    });
  }

  $("#search-box").keyup(function(event) {
    if(event.which == 13) {
      $("#search-box").blur();
      var searchText = $(this).val();
      var parts = searchText.split(" ");
      var index;
      searchText = parts[0];

      for(index = 1; index<parts.length; index++) {
        searchText += "+" + parts[index];
      }

      var request = {
        name: searchText,
        location: userLocation,
        rankBy: google.maps.places.RankBy.DISTANCE
      };

      var placesService = new google.maps.places.PlacesService(map);
      placesService.nearbySearch(request, nearbySearchCallback);
    }
    if(event.which == 27) {
      $(this).val("");
    }
  });



  $(document).click(function() {
    if(lastOpenInfoWindow!=null && isMobile) {
      $('#search-results').fadeOut();
    }
  })

  $('#search-box').click(function(event) {
    event.stopPropagation();
    $('#search-results').fadeIn();
  });

  $('#search-results').click(function(event) {
    event.stopPropagation();
    var target = event.target || event.srcElement;
    var flag = false;
    while(target != null && target.nodeName != 'UL') {
      if(target.nodeName == 'LI') {
        flag = true;
        break;
      }
      target = target.parentNode;
    }
    if(flag) {
      var searchElements = document.getElementsByClassName("search-element");
      for(var i=0; i<searchElements.length; i++) {
        if(searchElements[i] == target) {
          google.maps.event.trigger(markedPlaces[i], 'click');
        }
      }
    }
    else {
      console.log("not found");
    }
  });

  function setErrorMessage(errorMessage) {
    $('#search-results').html('<div class="error-message">' + errorMessage + '</div>');
    $('#search-results').fadeIn();
  }

  function nearbySearchCallback(results, status) {
    switch(status) {
      case google.maps.places.PlacesServiceStatus.OK:
      {
        var placesList = document.getElementById('search-results');
        placesList.innerHTML = "";
        places = results;

        var destinationLocations = getLocations(places);
        getDistanceMatrix(destinationLocations);
        break;
      }

      default:
      {
        alert(status);
      }

      // case google.maps.places.PlacesServiceStatus.ERROR:
      // {
      //   setErrorMessage("Error");
      //   break;
      // }

      // case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
      // {
      //   setErrorMessage("Invalid request");
      //   break;
      // }

      // case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
      // {
      //   setErrorMessage("Query limit exceeded");
      //   break;
      // }

      // case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
      // {
      //   setErrorMessage("Request denied");
      //   break;
      // }

      // case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
      // {
      //   setErrorMessage("Unknown error occurred");
      //   break;
      // }

      // case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
      // {
      //   setErrorMessage("No such result found");
      //   break;
      // }

      // default :
      // {
      //   setErrorMessage("Unexpected error occurred");
      //   break;
      // }
    }
  }

  function removeCurrentMarkers() {
    var i;
    var marker;
    if(markedPlaces != null) {
      for(i=0; i<markedPlaces.length; i++) {
        marker = markedPlaces[i];
        marker.setMap(null);
      }
    }
    markedPlaces = [];
    if(lastOpenInfoWindow != null) {
      lastOpenInfoWindow.close();
      lastOpenInfoWindow = null;
      $('#search-results').fadeIn();
    }
    destinationDistanceMatrix = null;
    var placesList = document.getElementById('search-results');
    placesList.innerHTML = "";
  }

  function getDistanceMatrix(destinationLocations) {
    var originsLocations = [];
    originsLocations.push(new google.maps.LatLng({lat: userLocation.lat, lng: userLocation.lng}));

    var requestParameters = {
      origins: originsLocations,
      destinations: destinationLocations,
      travelMode: google.maps.TravelMode.DRIVING
    };
    var distanceMatrixService = new google.maps.DistanceMatrixService();
    distanceMatrixService.getDistanceMatrix(requestParameters, validateDistanceMatrixResponse);
  }

  function validateDistanceMatrixResponse(results, status) {
    removeCurrentMarkers();
    switch(status) {
      case google.maps.DistanceMatrixStatus.OK:
      {
        createMarkers(results);
        break;
      }

      default:
      {
        alert(status);
      }

      // case google.maps.DistanceMatrixStatus.INVALID_REQUEST:
      // {
      //   setErrorMessage("Invalid request");
      //   break;
      // }

      // case google.maps.DistanceMatrixStatus.MAX_ELEMENTS_EXCEEDED:
      // {
      //   setErrorMessage("Maximum elements exceeded");
      //   break;
      // }

      // case google.maps.DistanceMatrixStatus.MAX_DIMENSIONS_EXCEEDED:
      // {
      //   setErrorMessage("Maximum dimensions exceeded");
      //   break;
      // }

      // case google.maps.DistanceMatrixStatus.OVER_QUERY_LIMIT:
      // {
      //   setErrorMessage("Query limit exceeded");
      //   break;
      // }

      // case google.maps.DistanceMatrixStatus.REQUEST_DENIED:
      // {
      //   setErrorMessage("Request denied");
      //   break;
      // }

      // case google.maps.DistanceMatrixStatus.UNKNOWN_ERROR:
      // {
      //   setErrorMessage("Unknown error occurred");
      //   break;
      // }

      // default :
      // {
      //   setErrorMessage("Unexpected error occurred");
      //   break;
      // }
    }
  }

  function createMarkers(results) {
    destinationDistanceMatrix = results.rows[0].elements;
    var bounds = new google.maps.LatLngBounds();
    var placesList = document.getElementById('search-results');
    placesList.innerHTML = "";
    var i, distance;
    for(i=0;i<places.length;i++) {
      distance = destinationDistanceMatrix[i].distance.text;
      var marker = createNewMarker(map, places[i]);
      marker.setPlace({location: places[i].geometry.location, placeId: places[i].place_id});
      marker.addListener('click', function() {
        var placeId = this.getPlace().placeId;
        map.panTo(this.getPosition());
        var placesService = new google.maps.places.PlacesService(map);
        placesService.getDetails({placeId: placeId}, function(place, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var infoWindow = new google.maps.InfoWindow({
              content: getWindowContent(place)
            });
            if(lastOpenInfoWindow!=null)
              lastOpenInfoWindow.close();
            infoWindow.setZIndex(30);
            infoWindow.open(map);
            infoWindow.setPosition(place.geometry.location);
            lastOpenInfoWindow = infoWindow;
            if(isMobile) {
              $('#search-results').fadeOut();
            }
            infoWindow.addListener('closeclick', function(event) {
              $('#search-results').fadeIn();
              lastOpenInfoWindow = null;
            });
          }
        });
      });
      markedPlaces.push(marker);
      placesList.innerHTML += createListElement(places[i], distance);
      bounds.extend(places[i].geometry.location);
    }
    map.fitBounds(bounds);
    map.setZoom(12);
  }

  function hideSearchResults() {
    if(isMobile) {
      $('#search-results').fadeOut();
    }
  }

  function linkClick(event, element) {
    var listElements = document.getElementsByClassName("search-element");
    var i;
    for(i=0;i<listElements.length;i++) {
      if(element == listElements[i]) {
        break;
      }
    }
    if(i>=0 && i<listElements.length) {
      google.maps.event.trigger(markedPlaces[i], 'click');
    }
  }
