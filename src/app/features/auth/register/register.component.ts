import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegisterRequest } from '../../../core/model/register-request.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  loading = false;
  error = '';

  form = new FormGroup({
    username: new FormControl('', {
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const data: RegisterRequest = {
      username: this.form.value.username!,
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.authService.register(data).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.error =
          'Registration failed. Username or email may already be taken.';
        this.loading = false;
      },
    });
  }

  get usernameIsInvalid() {
    return (
      this.form.controls.username.touched &&
      this.form.controls.username.dirty &&
      this.form.controls.username.invalid
    );
  }

  get emailIsInvalid() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    );
  }

  get passwordIsInvalid() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
    );
  }
}
