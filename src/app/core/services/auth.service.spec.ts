import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(), 
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear(); 
  });

  afterEach(() => httpMock.verify());

  it('should save token and username on login', () => {
    service.login({ username: 'test', password: 'pass' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'fake-jwt-token' });

    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(localStorage.getItem('username')).toBe('test');
  });

  it('should return true from isLoggedIn when token exists', () => {
    localStorage.setItem('token', 'some-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false from isLoggedIn when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should clear token and username on logout', () => {
    localStorage.setItem('token', 'some-token');
    localStorage.setItem('username', 'test');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('should send register request with correct body', () => {
    service
      .register({ username: 'test', email: 'test@test.com', password: 'pass' })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'test',
      email: 'test@test.com',
      password: 'pass',
    });
    req.flush({ username: 'test', email: 'test@test.com' });
  });
});
