'use strict';
export function UsernameValidation() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModelCtrl) {
      var userRegexp = new RegExp('^[a-z_][a-z0-9_\\-]{' + ((attrs.usernameValidation * 1 || 4) - 1) + ',}$', 'i');
      var isValid = function(s) {
        return s && userRegexp.test(s);
      };

      ngModelCtrl.$parsers.unshift(function(viewValue) {
        ngModelCtrl.$setValidity('username', isValid(viewValue));
        return viewValue;
      });

      ngModelCtrl.$formatters.unshift(function(modelValue) {
        ngModelCtrl.$setValidity('username', isValid(modelValue));
        return modelValue;
      });
    },
  };
}
