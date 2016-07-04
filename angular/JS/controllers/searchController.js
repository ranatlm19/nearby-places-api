app.controller('searchController', function($scope, $rootScope) {
  $scope.searchedPlaces = $rootScope.searchedPlaces;
  $scope.searchElementClick = function(event) {
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
          google.maps.event.trigger($rootScope.markedPlaces[i], 'click');
        }
      }
    }
    else {
      console.log("not found");
    }
  }
});
