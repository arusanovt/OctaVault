export class AddressesController {
  constructor(WalletService, NgTableParams, addresses) {
    'ngInject';
    this.addresses = addresses;
    this.addressesTable = new NgTableParams({sorting: {created: "desc"}, count: 5}, {data: addresses});
  }

  isAddressLimited() {
    return this.addresses.length > 4;
  }
}
