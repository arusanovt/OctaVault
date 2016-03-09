"use strict";
var WalletClient = require('./wallet-interface');

describe('Wallet interface', function () {
    it('should be able to connect',function(){
        let client = new WalletClient();
        return client.getAddresses();
    });

});
