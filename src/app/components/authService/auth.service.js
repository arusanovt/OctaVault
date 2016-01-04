export class AuthService {
  constructor($http, $log, vcRecaptchaService, API_BASE) {
    'ngInject';
    this.$http = $http;
    this.$log = $log;
    this.apiBase = API_BASE;
    this.recaptchaResponse = ()=> vcRecaptchaService.getResponse();
  }

  _request(action, data, method = 'POST') {
    var req = {
      method: method,
      url: `${this.apiBase}/auth/${action}`,
      headers: {
        'X-Recaptcha-Response': this.recaptchaResponse(),
      },
      data: data,
    };

    return $http(req);
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
