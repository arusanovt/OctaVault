'use strict';
export function mapValidationErrors($form, errorResponse) {
  if (errorResponse && errorResponse.data && errorResponse.data.errors) {
    for (let error of errorResponse.data.errors) {
      if ($form.hasOwnProperty(error.property)) {
        $form[error.property].$setValidity('server', false);
        $form[error.property].$error.server = error.message;
      } else {
        $form.$error.serverAll = error.message;
      }
    }
  }
}
