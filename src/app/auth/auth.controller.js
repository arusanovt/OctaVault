'use strict';
export class AuthController {
  constructor($state, AuthService) {
    'ngInject';

    this.registration = {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      pin: '',
      phone: '',
      secure: true,
    };
  }

  register() {
    console.log('register', this.registration);
    return false;
  }
}
