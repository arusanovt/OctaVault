export class WalletService {
  constructor($http, $log, $q, API_BASE) {
    'ngInject';
    this.$http = $http;
    this.$log = $log;
    this.apiBase = API_BASE;
    this.$q = $q;
  }

  _request(action, data, method = 'POST') {
    var req = {
      method: method,
      url: `${this.apiBase}/wallet/${action}`,
      data: data,
    };

    return this.$http(req).then((response) => {
      return response.data;
    });
  }

  transactions() {
    return this._request('transactions',{},'GET');
  }

  addresses() {
    return this._request('addresses',{},'GET');
  }

  addAddress(address){
    return this._request('addresses',{address:address});
  }
}
