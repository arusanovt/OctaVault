/* global moment:false */
import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { AuthService } from './components/authService/auth.service';
import { MainController } from './main/main.controller';
import { AuthController } from './auth/auth.controller.js';

angular.module('wallet',
  [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngMessages',
    'ngAria',
    'ui.router',
    'mgcrea.ngStrap',
    'toastr',
  ]
  )
  .constant('moment', moment)
  .constant('API_BASE', '/api')
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .service('AuthService', AuthService)
  .controller('MainController', MainController)
  .controller('AuthController', AuthController);
