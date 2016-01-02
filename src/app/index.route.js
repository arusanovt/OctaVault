export function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('wallet', {
      url: '/wallet',
      abstract: true,
      template: '<ui-view>',
      resolve: {
        user: function(AuthService) {
          'ngInject';
          return AuthService.user();
        },
      },
    })
    .state('wallet.list', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'ctrl',
    })
    .state('auth', {
      abstract: true,
      templateUrl: 'app/auth/auth.html',
    })
    .state('auth.login', {
      url: '/login',
      templateUrl: 'app/auth/login/login.html',
      controller: 'AuthController',
      controllerAs: 'ctrl',
    })
    .state('auth.register', {
      url: '/register',
      templateUrl: 'app/auth/register/register.html',
      controller: 'AuthController',
      controllerAs: 'ctrl',
    })
    .state('auth.resetPassword', {
      url: '/reset-password',
      templateUrl: 'app/auth/reset-password/reset-password.html',
      controller: 'AuthController',
      controllerAs: 'ctrl',
    });

  $urlRouterProvider.otherwise('/wallet/');
}
