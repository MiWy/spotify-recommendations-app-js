const spotiBar = angular.module("spotiBar", [
  "ngRoute",
  "checklist-model",
  "rzModule",
  "spotify"
]);

spotiBar.config([
  "$routeProvider",
  "SpotifyProvider",
  function($routeProvider, SpotifyProvider) {
    $routeProvider
      .when("/", {
        redirectTo: "/search"
      })
      .when("/search", {
        templateUrl: "views/search.html",
        controller: "SearchController"
      })
      .when("/results", {
        templateUrl: "views/results.html",
        controller: "ResultsController"
      });

    SpotifyProvider.setClientId("456d199b7ff04a969783dd914c902093");
    SpotifyProvider.setRedirectUri("https://miwy.github.io/spotify-recommendations-app-js/callback");
    SpotifyProvider.setScope("playlist-read-private");

    if (localStorage.getItem("spotify-token")) {
      SpotifyProvider.setAuthToken(localStorage.getItem("spotify-token"));
      console.log("Token got from localStorage.");
    } else {
      alert("You are not logged in");
      console.log("There was no token in localStorage.");
    }
  }
]);

// Service
spotiBar.factory("SharingResultsService", function() {
  let sharingRecommendationResults = {
    data: {}
  };
  return sharingRecommendationResults;
});

// Controllers

spotiBar.controller("LoginController", [
  "$scope",
  "Spotify",
  function($scope, Spotify) {
    $scope.login = function() {
      Spotify.login().then(
        function(data) {
          console.log(data);
          Spotify.setAuthToken(data);
          alert("You are now logged in");
        },
        function() {
          console.log("didn't log in");
        }
      );
    };
  }
]);

spotiBar.controller("SearchController", [
  "$scope",
  "Spotify",
  "SharingResultsService",
  function($scope, Spotify, SharingResultsService) {
    let seedsSelection = {};

    $scope.searchSeeds = function() {
      $scope.seedsSelection = seedsSelection;
      Spotify.getAvailableGenreSeeds().then(
        function(data) {
          $scope.seedsGenres = data.data.genres;
        },
        function(error) {
          alert("The access token expired. Please login again.");
        }
      );
      Spotify.search($scope.seedsQuery, "artist").then(function(data) {
        $scope.seedsArtists = data.data.artists.items;
      });
      Spotify.search($scope.seedsQuery, "track").then(function(data) {
        $scope.seedsTracks = data.data.tracks.items;
      });
    };

    $scope.searchRecommendations = function() {
      if (checkIfSeedsInLimit()) {
        Spotify.getRecommendations(prepCriteria()).then(
          function(data) {
            SharingResultsService.data = data.data;
            console.log(data);
            document.location.href = "/spotify-recommendations-app-js/#!/results";
          },
          function(error) {
            alert("The access token expired. Please login again.");
          }
        );
      } else {
        alert("You can select up to 5 different seeds.");
      }
    };

    checkIfSeedsInLimit = function() {
      if (
        $scope.seedsSelection == undefined ||
        ($scope.seedsSelection.artists == undefined &&
          $scope.seedsSelection.tracks == undefined &&
          $scope.seedsSelection.genres == undefined)
      ) {
        alert("You did not define any seeds");
        return false;
      }

      let numberOfSeeds = 0;
      if (!($scope.seedsSelection.artists == undefined)) {
        numberOfSeeds =
          numberOfSeeds + Object.keys($scope.seedsSelection.artists).length;
      }
      if (!($scope.seedsSelection.genres == undefined)) {
        numberOfSeeds =
          numberOfSeeds + Object.keys($scope.seedsSelection.genres).length;
      }
      if (!($scope.seedsSelection.tracks == undefined)) {
        numberOfSeeds =
          numberOfSeeds + Object.keys($scope.seedsSelection.tracks).length;
      }
      if (0 < numberOfSeeds && 5 >= numberOfSeeds) {
        return true;
      } else {
        return false;
      }
    };

    prepCriteria = function() {
      let criteria = {};
      if ($scope.seedsSelection.artists != undefined) {
        criteria.seed_artists = $scope.seedsSelection.artists.join();
      }
      if ($scope.seedsSelection.tracks != undefined) {
        criteria.seed_tracks = $scope.seedsSelection.tracks.join();
      }
      if ($scope.seedsSelection.genres != undefined) {
        criteria.seed_genres = $scope.seedsSelection.genres.join();
      }
      if ($scope.limit != null) {
        criteria.limit = $scope.limit;
      }
      if ($scope.duration != null) {
        criteria.target_duration_ms = $scope.duration;
      }
      if ($scope.key != null) {
        criteria.target_key = $scope.key;
      }
      if ($scope.ismajor != null) {
        criteria.target_mode = $scope.ismajor;
      }
      if ($scope.tempo != null) {
        criteria.target_tempo = $scope.tempo;
      }
      if (!isNaN($scope.sliderAcousticness)) {
        criteria.target_acousticness = $scope.sliderAcousticness / 100;
      }
      if (!isNaN($scope.sliderDanceability)) {
        criteria.target_danceability = $scope.sliderDanceability / 100;
      }
      if (!isNaN($scope.sliderEnergy)) {
        criteria.target_energy = $scope.sliderEnergy / 100;
      }
      if (!isNaN($scope.sliderInstrumentalness)) {
        criteria.target_instrumentalness = $scope.sliderInstrumentalness / 100;
      }
      if (!isNaN($scope.sliderLiveness)) {
        criteria.target_liveness = $scope.sliderLiveness / 100;
      }
      if (!isNaN($scope.sliderPopularity)) {
        criteria.target_popularity = $scope.sliderPopularity / 100;
      }
      if (!isNaN($scope.sliderSpeechiness)) {
        criteria.target_speechiness = $scope.sliderSpeechiness / 100;
      }
      if (!isNaN($scope.sliderValence)) {
        criteria.target_valence = $scope.sliderValence / 100;
      }
      return criteria;
    };
  }
]);

spotiBar.controller("ResultsController", [
  "$scope",
  "SharingResultsService",
  function($scope, SharingResultsService) {
    $scope.recommendedTracks = SharingResultsService.data.tracks;
  }
]);
