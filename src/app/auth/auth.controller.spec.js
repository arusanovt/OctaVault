'use strict';

describe('controllers', () => {
  let vm;
  let authService;
  let $state;
  let $q;
  let $scope;

  beforeEach(angular.mock.module('wallet'));

  beforeEach(inject(($controller, _$q_, _$rootScope_, _$state_, $stateParams, AuthService) => {
    authService = AuthService;
    $state = _$state_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    spyOn($state, 'go').and.returnValue({});
    vm = $controller('AuthController', {$scope: $scope, AuthService: authService});
  }));

  it('should have a registration object', () => {
    expect(vm.registration).toEqual(jasmine.any(Object));
  });

  it('should have a login object', () => {
    expect(vm.login).toEqual(jasmine.any(Object));
  });

  it('should have a resetPassword object', () => {
    expect(vm.resetPassword).toEqual(jasmine.any(Object));
  });

  it('should have a resetPasswordComplete object', () => {
    expect(vm.resetPasswordComplete).toEqual(jasmine.any(Object));
  });

  it('should have a code object', () => {
    expect(vm.resetPasswordComplete).toEqual(jasmine.any(Object));
  });


  it('should be able to renew code', () => {
    spyOn(authService, 'renewCode').and.returnValue($q.resolve({}));
    vm.renewCode();
    expect(authService.renewCode).toHaveBeenCalled();
  });

  it('should be able to reset passworde', () => {
    spyOn(authService, 'resetPassword').and.returnValue($q.resolve({}));
    vm.doResetPassword();
    expect(authService.resetPassword).toHaveBeenCalled();
  });

  it('should be able to login', () => {
    spyOn(authService, 'login').and.returnValue($q.resolve({confirmationCodeRequired: false}));
    vm.doAuth('login', {});
    $scope.$digest();
    expect(authService.login).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('wallet.list');
  });

  it('should redirect to code when login requires code', () => {
    spyOn(authService, 'login').and.returnValue($q.resolve({confirmationCodeRequired: true, type: 'login'}));
    vm.doAuth('login', {});
    $scope.$digest();
    expect(authService.login).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('auth.code',{type: 'login'});
  });

  it('should be able to register', () => {
    spyOn(authService, 'register').and.returnValue($q.resolve({confirmationCodeRequired: false}));
    vm.doAuth('register', {});
    $scope.$digest();
    expect(authService.register).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('wallet.list');
  });

  it('should redirect to code when register requires code', () => {
    spyOn(authService, 'register').and.returnValue($q.resolve({confirmationCodeRequired: true, type: 'register'}));
    vm.doAuth('register', {});
    $scope.$digest();
    expect(authService.register).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('auth.code',{type: 'register'});
  });

  it('should be able to validate code', () => {
    spyOn(authService, 'validateCode').and.returnValue($q.resolve({}));
    vm.doAuth('validateCode', {});
    $scope.$digest();
    expect(authService.validateCode).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('wallet.list');
  });

});
