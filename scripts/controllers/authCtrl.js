'use strict';

/**
 * The authentication controller (login & facebook)
 *
 */

habitrpg.controller('AuthCtrl',
  ['$scope', '$rootScope', 'Facebook', 'LocalAuth', 'User', '$http', '$location', 'ApiUrlService',
  function($scope, $rootScope, Facebook, LocalAuth, User, $http, $location, ApiUrlService) {
    $scope.Facebook = Facebook;
    $scope.Local = LocalAuth;

    var showedFacebookMessage = false;

    $scope.initLoginForm = function(useUUID) {
      $scope.useUUID = useUUID;
      $scope.login = {username:'',password:'',endpoint:ApiUrlService.get()};
      $scope.registerVals = { endpoint: ApiUrlService.get()};
    };

    $scope.setApiEndpoint = function (newEndpoint) {
      habitrpg.value('API_URL', newEndpoint);
      localStorage.setItem('habitrpg-endpoint', newEndpoint);
      ApiUrlService.setApiUrl(newEndpoint);

      return newEndpoint;
    };

    document.addEventListener('deviceready', function() {

      FB.init({
        appId: '374812825970494',
        nativeInterface: CDV.FB,
        useCachedDialogs: false
      });

    }, false);

    $scope.register = function(form, registerVals) {
      if (form.$invalid) {
        //TODO highlight invalid inputs
        // we have this as a workaround for https://github.com/HabitRPG/habitrpg-mobile/issues/64
        return;
      }

      $scope.setApiEndpoint(registerVals.endpoint);

      $http.post(ApiUrlService.get() + '/api/v2/register', registerVals)
        .success(function(data, status, headers, config) {
          User.authenticate(data.id, data.apiToken, function(err) {
            $location.path("/habit");
          });
        })
        .error(function(data, status, headers, config) {
          if (status === 0) {
            alert("Server not currently reachable, try again later");
          } else if (!!data && !!data.err) {
            alert(data.err);
          } else {
            alert('ERROR: ' + status);
          }
        });
    }

    $scope.auth = function() {
      var data = {
        username: $scope.login.username,
        password: $scope.login.password
      }

      var runAuth = function(id, token){
        User.authenticate(id, token, function(err) {
          $location.path("/habit");
        });
      }

      $scope.setApiEndpoint($scope.login.endpoint);

      if ($scope.useUUID) {
        runAuth($scope.login.username, $scope.login.password);
      } else {
        $http.post(ApiUrlService.get() + '/api/v2/user/auth/local', data)
          .success(function(data, status, headers, config) {
            runAuth(data.id, data.token);
          }).error(function(data, status, headers, config) {
            if (status === 0) {
              alert("Server not currently reachable, try again later");
            } else if (!!data && !!data.err) {
              alert(data.err);
            } else {
              alert('ERROR: ' + status);
            }
          });
      }
    }
  }
]);
