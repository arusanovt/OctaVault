export function config($logProvider, $locationProvider, $httpProvider) {
  'ngInject';

  // Enable log
  $logProvider.debugEnabled(true);

  //Enable html5 mode routing
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');

  //Handling csrf
  $httpProvider.defaults.xsrfHeaderName = 'xsrf-token';
  $httpProvider.defaults.xsrfCookieName = 'x-csrf-token';

  //Handling auth
  $httpProvider.interceptors.push(function($q, $injector) {
    'ngInject';
    return {
      responseError: function(rejection) {
        if (rejection.status === 401) {
          let state = $injector.get('$state');
          if (rejection.data.reason === 'registration_code' || rejection.data.reason === 'login_code') {
            //User haven't passed 2 step auth yet
            state.go('auth.code', {type: rejection.data.reason});
          } else {
            state.go('auth.login');
          }

          return rejection;
        }

        return $q.reject(rejection);
      },
    };
  });

}
