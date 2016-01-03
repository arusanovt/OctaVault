'use strict';
export function ServerValidation() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModelCtrl) {

      ngModelCtrl.$parsers.unshift(function(viewValue) {
        //Set valid on any change
        ngModelCtrl.$setValidity('server', true);
        return viewValue;
      });

      ngModelCtrl.$formatters.unshift(function(modelValue) {
        ngModelCtrl.$setValidity('server', true);
        return modelValue;
      });
    },
  };
}
