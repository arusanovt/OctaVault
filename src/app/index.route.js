export function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('wallet', {
      url: '/wallet',
      abstract: true,
      template: '<ui-view>',
      resolve: {
        user: function (AuthService) {
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
      redirectTo:'wallet.list.transactions',
    })
    .state('wallet.list.transactions', {
      url: 'transactions',
      templateUrl: 'app/main/transactions/transactions.html',
      controller: 'TransactionController',
      controllerAs: 'ctrl',
      resolve: {
        transactions: function (WalletService) {
          'ngInject';
          return WalletService.transactions();
        },
      }
    })
    .state('wallet.list.addresses', {
      url: 'addresses',
      templateUrl: 'app/main/addresses/addresses.html',
      controller: 'AddressesController',
      controllerAs: 'ctrl',
      resolve: {
        addresses: function (WalletService) {
          'ngInject';
          return WalletService.addresses();
        },
      }
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
    })
    .state('auth.resetPasswordComplete', {
      url: '/reset-password-complete?code',
      templateUrl: 'app/auth/reset-password/reset-password-complete.html',
      controller: 'AuthController',
      controllerAs: 'ctrl',
    })
    .state('auth.code', {
      url: '/code?type',
      templateUrl: 'app/auth/code/code.html',
      controller: 'AuthController',
      controllerAs: 'ctrl',
    });

  $urlRouterProvider.otherwise('/wallet/');
}
