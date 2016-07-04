app.controller('mainController', ['$scope', '$rootScope', '$location', '$compile', 'GeolocationService', 'lazyLoadApi', '$templateRequest', '$timeout',
  function($scope, $rootScope, $location, $compile, GeolocationService, lazyLoadApi, $templateRequest, $timeout) {

    $scope.name = 'World';
    $scope.userLocation = {
      lat: 12.798314,
      lng: 77.594545
    };
    lazyLoadApi.then(initializeMap);
    $scope.getWeekDayDetails = function(text) {
      var result = {};
      var array = [];
      array = text.split(': ');
      result.day = array[0];
      result.sched = array[1];
      return result;
    }

    $scope.search = function(event) {
      if(event.which == 13) {
        $location.path('/');
        var textSearch = $scope.searchText;
        var parts = textSearch.split(" ");
        var index;
        textSearch = parts[0];

        for(index = 1; index<parts.length; index++) {
          textSearch += "+" + parts[index];
        }

        var request = {
          name: textSearch,
          location: $scope.userLocation,
          rankBy: google.maps.places.RankBy.DISTANCE
        };

        var placesService = new google.maps.places.PlacesService($scope.map);
        placesService.nearbySearch(request, nearbySearchCallback);
        event.target.blur();
      }
    }

    $scope.searchBoxClick = function(event) {
      document.getElementById('search-results').style.display="block";
    }

    function setErrorMessage(text) {
      console.log(text);
    }

    nearbySearchCallback = function(results, status) {
      if(status == google.maps.places.PlacesServiceStatus.OK) {
        $rootScope.searchedPlaces = results;
        var destinationLocations = getLocations($rootScope.searchedPlaces);
        getDistanceMatrix(destinationLocations);
      } else {
        alert(status);
      }
    }

    function getLocations(searchedPlaces) {
      var i;
      var elem, placeLocation, lat, lng;
      var locations = [];
      for(i=0;i<searchedPlaces.length;i++) {
        placeLocation = searchedPlaces[i].geometry.location;
        lat = placeLocation.lat();
        lng = placeLocation.lng();
        locations.push(new google.maps.LatLng({lat: lat, lng: lng}));
      }
      return locations;
    }

    function getDistanceMatrix(destinationLocations) {
      var originsLocations = [];
      originsLocations.push(new google.maps.LatLng({lat: $scope.userLocation.lat, lng: $scope.userLocation.lng}));

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
          break;
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

    function removeCurrentMarkers() {
      var i;
      var marker;
      if($rootScope.markedPlaces) {
        for(i=0; i<$rootScope.markedPlaces.length; i++) {
          marker = $rootScope.markedPlaces[i];
          marker.setMap(null);
        }
      }
      document.getElementById('search-results').style.display="block";
      $rootScope.markedPlaces = [];
      if($rootScope.lastOpenInfoWindow != null) {
        $rootScope.lastOpenInfoWindow.close();
        $rootScope.lastOpenInfoWindow = null;
      }
      $rootScope.destinationDistanceMatrix = null;
    }

    function createMarkers(results) {
      $rootScope.destinationDistanceMatrix = results.rows[0].elements;
      var bounds = new google.maps.LatLngBounds();
      var i;
      for(i=0;i<$rootScope.searchedPlaces.length;i++) {
        var distance = $rootScope.destinationDistanceMatrix[i].distance.text;
        $rootScope.searchedPlaces[i].distance = distance;
        var place = $rootScope.searchedPlaces[i];
        var marker = createNewMarker($scope.map, place);
        marker.setPlace({location: place.geometry.location, placeId: place.place_id});
        marker.addListener('click', markerClickListener);
        $rootScope.markedPlaces.push(marker);
        bounds.extend(place.geometry.location);
      }
      $scope.map.fitBounds(bounds);
      $scope.map.setZoom(12);
      $location.path('/search');
      $scope.$apply();
    }

    function markerClickListener() {
      var place_id = this.getPlace().placeId;
      if($rootScope.lastOpenInfoWindow!=null)
        $rootScope.lastOpenInfoWindow.close();
      $scope.map.panTo(this.getPosition());
      var placesService = new google.maps.places.PlacesService($scope.map);
      placesService.getDetails({placeId: place_id}, function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.currentPlace = place;
          $templateRequest('JS/partials/infowindow.html').then(function(template) {
            var compiled = $compile(template)($scope);
            $timeout(function () {
              $rootScope.$apply(place);
              var infoWindow = new google.maps.InfoWindow({
                content: compiled.html()
              });
              infoWindow.setZIndex(30);
              infoWindow.open($scope.map);
              infoWindow.setPosition(place.geometry.location);
              $rootScope.lastOpenInfoWindow = infoWindow;
              if($rootScope.isMobile) {
                document.getElementById('search-results').style.display="none";
              }
              infoWindow.addListener('closeclick', function(event) {
                document.getElementById('search-results').style.display="block";
                lastOpenInfoWindow = null;
              });
            }, 250);
          });
        }
      });
}

function createNewMarker(map, place) {
  var marker = new google.maps.Marker({
    map: map,
    title: place.name,
    position: place.geometry.location
  });
  return marker;
}

function initializeMap() {
  var userAgent = navigator.userAgent;
  var mapDiv = document.getElementById('map');

  if (userAgent.indexOf('iPhone') != -1 || userAgent.indexOf('Android') != -1 ) {
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapDiv.style.minHeight = '0';
    mapDiv.style.minWidth = '0';
    $rootScope.isMobile = true;
  }
  $rootScope.markedPlaces = null;
  $rootScope.lastOpenInfoWindow = null;
  $rootScope.destinationDistanceMatrix = null;
  $rootScope.searchedPlaces = [];
  var mapOptions = {
    zoom: 12,
    center: $scope.userLocation
  };

  $scope.map = new google.maps.Map(mapDiv, mapOptions);
  createUserMarker();
  GeolocationService().then(function(position) {
    $scope.userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    updateCenter();
  });

}

function updateCenter() {
  $scope.map.setCenter($scope.userLocation);
  $scope.userMarker.setPosition($scope.userLocation);
}

function createUserMarker() {
  var imageProperties = {
    url: '../angular/img/currentLocation.png',
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  };


  $scope.userMarker = new google.maps.Marker({
    position: $scope.userLocation,
    map: $scope.map,
    icon: imageProperties
  });
}
}]);
