// Get latest user location
app.factory("GeolocationService", ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {
  return function () {
    var deferred = $q.defer();

    if (!$window.navigator) {
      $rootScope.$apply(function() {
        deferred.reject(new Error("Geolocation is not supported"));
      });
    } else {
      $window.navigator.geolocation.getCurrentPosition(function (position) {
        $rootScope.$apply(function() {
          deferred.resolve(position);
        });
      }, function (error) {
        $rootScope.$apply(function() {
          deferred.reject(error);
        });
      });
    }

    return deferred.promise;
  }
}]);

//Load the google Map
app.service('lazyLoadApi', function lazyLoadApi($window, $q) {
  function loadScript() {
    var s = document.createElement('script')
    s.src = '//maps.googleapis.com/maps/api/js?key=AIzaSyArkU8fqloFnmgDfVOMqaAwJjC_i0V7za4&libraries=places&callback=initMap'
    document.body.appendChild(s)
  }
  var deferred = $q.defer()

  $window.initMap = function() {
    deferred.resolve()
  }

  if ($window.attachEvent) {
    $window.attachEvent('onload', loadScript)
  } else {
    $window.addEventListener('load', loadScript, false)
  }

  return deferred.promise
});