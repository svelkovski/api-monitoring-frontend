import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  it('should not submit when form is invalid', () => {
    component.submit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login with correct values', () => {
    authService.login.and.returnValue(of({ token: 'fake-token' }));
    component.form.setValue({ username: 'test', password: 'password123' });

    console.log('username errors:', component.form.get('username')?.errors);
    console.log('password errors:', component.form.get('password')?.errors);
    console.log('username status:', component.form.get('username')?.status);
    console.log('password status:', component.form.get('password')?.status);

    component.submit();
    expect(authService.login).toHaveBeenCalledWith({
      username: 'test',
      password: 'password123',
    });
  });

  it('should navigate to dashboard on successful login', fakeAsync(() => {
    authService.login.and.returnValue(of({ token: 'fake-token' }));
    component.form.setValue({ username: 'test', password: 'password123' });
    component.submit();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should set error message on failed login', fakeAsync(() => {
    authService.login.and.returnValue(
      throwError(() => new Error('Unauthorized')),
    );
    component.form.setValue({ username: 'test', password: 'wrongpass' });
    component.submit();
    tick();
    expect(component.error).toBe('Invalid username or password');
    expect(component.loading).toBeFalse();
  }));

  it('should mark form invalid when fields are empty', () => {
    component.form.setValue({ username: '', password: '' });
    expect(component.form.invalid).toBeTrue();
  });
});
