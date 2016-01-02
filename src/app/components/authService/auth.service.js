export class AuthService {
  constructor($http, $log, API_BASE) {
    'ngInject';
    this.$http = $http;
    this.$log = $log;
    this.apiBase = API_BASE;
  }

  user() {
    this.$http.get(`${this.apiBase}/wallet/@me`)
      .then((response) => {
        return response.data;
      });
  }
}
