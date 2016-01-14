export class MainController {
  constructor(AuthService, user, $state) {
    'ngInject';
    this.logout = AuthService.logout.bind(AuthService);
    this.user = user;
  }
}
