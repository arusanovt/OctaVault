'use strict';
export class AuthController {
  constructor($scope, $state, AuthService, vcRecaptchaService) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
    this.recaptchaResponse = ()=> vcRecaptchaService.getResponse();
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

    this.resetPasword = {
      username: '',
      email: '',
    };

    //TODO: Replace recaptcha with another library
    //https://github.com/mllrsohn/angular-re-captcha (it's using old api need o fork and create pull request)
    //Mix recaptcha property into
    for (let obj of [this.registration, this.resetPasword]) {
      Object.defineProperty(obj, 'recaptcha', {
        get: ()=> {
          return this.recaptchaResponse();
        },
      });
    }

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
          $form.$setValidity('server', false);
          $form.$error.serverAll = error.message;
        }
      }
    }
  }

  doRegistration() {
    let $form = this.$scope.form;
    $form.$setValidity('server', true);

    console.log('register', this.registration);
    this.authService
      .register(this.registration)
      .then((user)=> {
        console.log('registered', user);
        this.$state.transitionTo('wallet.list');
      })
      .catch((err)=>this._mapValidationErrors(err));
    return false;
  }

  doLogin() {
    console.log('login', this.login);
    this.authService
      .login(this.login);
    return false;
  }

  doResetPassword() {
    console.log('resetPassword', this.resetPasword);
    this.authService.resetPassword(this.resetPasword);
    return false;
  }
}
