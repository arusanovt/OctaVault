export class TransactionController {
  constructor(WalletService, NgTableParams, transactions) {
    'ngInject';
    this.transactionTable = new NgTableParams({sorting: {created: "desc"}, count: 25}, {data: transactions});
  }
}
