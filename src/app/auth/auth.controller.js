'use strict';
export class AuthController {
  constructor($scope, $state, $stateParams, AuthService) {
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
      sent: false,
    };

    this.resetPasswordComplete = {
      username: '',
      password: '',
      code: $stateParams.code,
    };

    this.code = {
      type: $stateParams.type,
      code: '',
      refreshMessage: '',
    };
  }

  renewCode() {
    //Ask server for new code
    this.authService.renewCode(this.code.type)
      .then((responseData)=> this.code.refreshMessage = 'New code sent')
      .catch((err)=> this.code.refreshMessage = `Interval from last SMS isn't passed.`);
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

  doResetPassword() {
    this.authService.resetPassword(this.resetPassword)
      .then((responseData)=> {
        this.resetPassword.sent = true;
      })
      .catch((err)=>this._mapValidationErrors(err));
  }

  doAuth(method, data, goTo = 'wallet.list') {
    console.log(method, data);

    this.authService[method](data)
      .then((responseData)=> {
        console.log(method, responseData);
        if (responseData.confirmationCodeRequired) {
          this.$state.go('auth.code', {type: responseData.type});
        } else {
          this.$state.go(goTo);
        }
      })
      .catch((err)=>this._mapValidationErrors(err));
  }

}
