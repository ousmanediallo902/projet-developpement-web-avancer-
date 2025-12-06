import { TestBed } from '@angular/core/testing';
import { RoleGuard } from './role-guard';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('Auth', ['isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: Auth, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should allow admin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    expect(guard.canActivate()).toBeTrue();
  });

  it('should block non-admin and redirect', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
