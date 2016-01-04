'use strict';
export class AuthController {
  constructor($scope, $state, AuthService) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
    this.authService = AuthService;

    this.registration = {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      pin: '',
      phone: '',
      secure: true,
    };

    this.login = {
      username: '',
      password: '',
    };

    this.resetPassword = {
      username: '',
      email: '',
    };
  }

  _mapValidationErrors(errorResponse) {
    if (errorResponse && errorResponse.data && errorResponse.data.errors) {
      console.log(errorResponse.data.errors);
      let $form = this.$scope.form;

      //Map into dictionary
      for (let error of errorResponse.data.errors) {
        if ($form.hasOwnProperty(error.property)) {
          $form[error.property].$setValidity('server', false);
          $form[error.property].$error.server = error.message;
        } else {
          $form.$error.serverAll = error.message;
        }
      }
    }
  }

  doAuth(method, data, goTo = 'wallet.list') {
    console.log(method, data);

    this.authService[method](data)
      .then((responseData)=> {
        console.log(method, responseData);
        this.$state.transitionTo(goTo);
      })
      .catch((err)=>this._mapValidationErrors(err));
  }

}
