var app = angular.module('google-maps-nearby-search-app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/search', {
    templateUrl: 'JS/partials/searchResults.html',
    controller: 'searchController'
  })
  .otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
});