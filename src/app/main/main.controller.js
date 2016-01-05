export class MainController {
  constructor(AuthService) {
    'ngInject';
    this.logout = AuthService.logout.bind(AuthService);
  }
}
