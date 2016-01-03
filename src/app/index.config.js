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
          $injector.get('$state').transitionTo('auth.login');
          return rejection;
        }

        return $q.reject(rejection);
      },
    };
  });

}
