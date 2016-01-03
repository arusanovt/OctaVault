export class AuthService {
  constructor($http, $log, API_BASE) {
    'ngInject';
    this.$http = $http;
    this.$log = $log;
    this.apiBase = API_BASE;
  }

  user() {
    return this.$http.get(`${this.apiBase}/wallet/@me`)
      .then((response) => {
        return response.data;
      });
  }

  login(loginModel) {
    return this.$http.post(`${this.apiBase}/auth/login`, loginModel)
      .then((response) => {
        return response.data;
      });
  }

  register(registerModel) {
    return this.$http.post(`${this.apiBase}/auth/register`, registerModel)
      .then((response) => {
        return response.data;
      });
  }

  resetPassword(resetPasswordModel) {
    return this.$http.post(`${this.apiBase}/auth/reset-password`, resetPasswordModel)
      .then((response) => {
        return response.data;
      });
  }
}
