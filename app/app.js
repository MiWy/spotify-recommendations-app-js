const spotiBar = angular.module("spotiBar", [
  "ngRoute",
  "checklist-model",
  "spotify",
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
      console.log("starting to login");
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

    $scope.seedOrInstruction = "instruction";

    $scope.criteriaOptions = [
      { level: "Very low", value: "0.00" },
      { level: "Low", value: "0.25" },
      { level: "Medium", value: "0.50" },
      { level: "High", value: "0.75" },
      { level: "Very high", value: "1.00" }
    ];

    $scope.searchSeeds = function() {
      $scope.seedsSelection = seedsSelection;
      Spotify.getAvailableGenreSeeds().then(
        function(data) {
          $scope.seedOrInstruction = "seeds";
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
      if ($scope.limitInput != null) {
        if ($scope.limitInput > 0 && $scope.limitInput < 101) {
          criteria.limit = $scope.limitInput;
        }
      }
      if ($scope.durationInput != null) {
        if ($scope.durationInput > 0) {
          criteria.target_duration_ms = $scope.durationInput;
        }
      }
      if ($scope.keyInput != null) {
        if ($scope.keyInput > -1 && $scope.keyInput < 12) {
          criteria.target_key = $scope.keyInput;
        }
      }
      if ($scope.isMajorSelect != null) {
        criteria.target_mode = $scope.isMajorSelect;
      }
      if ($scope.tempoInput != null) {
        if ($scope.tempoInput > 0) {
          criteria.target_tempo = $scope.tempoInput;
        }
      }
      if ($scope.acousticnessSelect != null) {
        criteria.target_acousticness = $scope.acousticnessSelect.value;
      }
      if ($scope.danceabilitySelect != null) {
        criteria.target_danceability = $scope.danceabilitySelect.value;
      }
      if ($scope.energySelect != null) {
        criteria.target_energy = $scope.energySelect.value;
      }
      if ($scope.livenessSelect != null) {
        criteria.target_liveness = $scope.livenessSelect.value;
      }
      if ($scope.instrumentalnessSelect != null) {
        criteria.target_instrumentalness = $scope.instrumentalnessSelect.value;
      }
      if ($scope.popularitySelect != null) {
        criteria.target_popularity = $scope.popularitySelect.value;
      }
      if ($scope.speechinessSelect != null) {
        criteria.target_speechiness = $scope.speechinessSelect.value;
      }
      if ($scope.valenceSelect != null) {
        criteria.target_valence = $scope.valenceSelect.value;
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


