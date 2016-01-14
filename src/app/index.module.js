/* global moment:false */
import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';

//Services
import { AuthService } from './components/authService/auth.service';
import { WalletService } from './components/walletService/wallet.service';

//Directives
import { ServerValidation } from './components/validation/servervalidation.directive';
import { NumberValidation } from './components/validation/validnumber.directive';
import { PasswordValidation } from './components/validation/password.directive';
import { UsernameValidation } from './components/validation/username.directive';
import { PhoneNumberValidation } from './components/validation/phonenumber.directive';

//Controllers
import { MainController } from './main/main.controller';
import { TransactionController } from './main/transactions/transactions.controller';
import { AddressesController } from './main/addresses/addresses.controller';
import { AuthController } from './auth/auth.controller.js';

angular.module('wallet',
  [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngMessages',
    'ngAria',
    'ngTable',
    'ui.router',
    'mgcrea.ngStrap',
    'toastr',
    'vcRecaptcha',
  ]
  )
  .constant('moment', moment)
  .constant('phoneUtils', phoneUtils)
  .constant('API_BASE', '/api')
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .service('AuthService', AuthService)
  .service('WalletService', WalletService)
  .directive('serverValidation', ServerValidation)
  .directive('numberValidation', NumberValidation)
  .directive('usernameValidation', UsernameValidation)
  .directive('phoneNumberValidation', PhoneNumberValidation)
  .directive('passwordValidation', PasswordValidation)
  .controller('MainController', MainController)
  .controller('TransactionController', TransactionController)
  .controller('AddressesController', AddressesController)
  .controller('AuthController', AuthController);
