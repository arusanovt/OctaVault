'use strict';
export function PasswordValidation() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModelCtrl) {
      var checks = attrs.passwordValidation || 'luns6';
      var m = checks.match(/([0-9]+)/);
      var minLength = (m ? parseInt(m[1], 10) : null);

      var isValid = function(value) {
        return checks.indexOf('l') >= 0 && !value.match(/[a-z]/) ? false : checks.indexOf('u') >= 0 && !value.match(/[A-Z]/) ? false : checks.indexOf('n') >= 0 && !value.match(/[0-9]/) ? false : checks.indexOf('s') >= 0 && !value.match(/[^a-zA-Z0-9]/) ? false : !(minLength !== null && minLength > value.length);
      };

      ngModelCtrl.$parsers.unshift(function(viewValue) {
        ngModelCtrl.$setValidity('password', isValid(viewValue));
        return viewValue;
      });

      ngModelCtrl.$formatters.unshift(function(modelValue) {
        ngModelCtrl.$setValidity('password', isValid(modelValue));
        return modelValue;
      });
    },
  };
}
