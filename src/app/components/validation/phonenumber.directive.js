'use strict';
export function PhoneNumberValidation($log, phoneUtils) {
  'ngInject';

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attrs, ctrl) {
      var el = element[0];

      function validator(value) {
        var isValid = false;
        try {
          isValid = phoneUtils.isValidNumber(value);
        }
        catch (err) {
          $log.debug(err);
        }

        var valid = ctrl.$isEmpty(value) || isValid;
        ctrl.$setValidity('phoneNumber', valid);
        return value;
      }

      ctrl.$formatters.push(validator);
      ctrl.$parsers.push(validator);
    },
  };
}
