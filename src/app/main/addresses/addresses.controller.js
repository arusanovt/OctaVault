import {mapValidationErrors} from '../../utils/errors';


export class AddressesController {
  constructor($modal, $scope, WalletService, NgTableParams, addresses) {
    'ngInject';
    this.walletService = WalletService;
    this.addresses = addresses;
    this.$scope = $scope;
    this.addressesTable = new NgTableParams({sorting: {created: "desc"}, count: 25}, {data: this.addresses});
    this.$addAddressModal = $modal({
      scope: $scope,
      templateUrl: 'app/main/addresses/add-address.html',
      show: false,
    });
    this.addAddressModel = {
      address: ''
    }
  }

  isAddressLimited() {
    return this.addresses.length > 100;
  }

  addAddress() {
    this.$addAddressModal.show()
  }

  addNewAddress() {
    this.walletService.addAddress(this.addAddressModel.address)
      .then((responseData)=> {
        this.addAddressModel.address = '';
        this.$addAddressModal.hide();
        this.addresses = responseData;
        this.addressesTable.settings({
          data: this.addresses
        });
        this.addressesTable.reload();
      })
      .catch((err)=>mapValidationErrors(this.$scope.form, err));
  }
}
