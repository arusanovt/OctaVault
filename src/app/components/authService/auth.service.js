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

    return $http(req).then((response) => {
      return response.data;
    });
  }

  user() {
    return this.$http.get(`${this.apiBase}/wallet/@me`)
      .then((response) => {
        return response.data;
      });
  }

  login(loginModel) {
    return this._request('login', loginModel);
  }

  logout(loginModel) {
    return this.$http.get(`${this.apiBase}/auth/logout`, loginModel)
      .then((response) => {
        return response.data;
      });
  }

  register(registerModel) {
    return this._request('register', registerModel);
  }

  resetPassword(resetPasswordModel) {
    return this._request('reset-password', resetPasswordModel);
  }

  validateCode(code) {
    return this._request('validate-code', code);
  }

  renewCode(codeType) {
    return this._request('renew-code', {type:codeType});
  }
}
