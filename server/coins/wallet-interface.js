'use strict';

let bitcoin = require('bitcoin-promise');
let config = require('../../config');

class WalletClient {
  constructor(opts) {
    this.rpcClient = new bitcoin.Client(Object.assign({}, opts, config.wallet));
  }

  getAddresses() {
    return this.rpcClient.getAddressesByAccount();
  }

}

module.exports = WalletClient;
