export function runBlock($rootScope, $state) {
  'ngInject';
  $rootScope.$on('$stateChangeStart', function (evt, to, params) {
    if (to.redirectTo) {
      evt.preventDefault();
      $state.go(to.redirectTo, params)
    }
  });
}
