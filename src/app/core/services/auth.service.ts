import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RegisterResponse } from '../model/register-response.model';
import { RegisterRequest } from '../model/register-request.model';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../model/login-request.model';
import { LoginResponse } from '../model/login-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private httpClient = inject(HttpClient);

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      data,
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  getUsername(): string {
    return localStorage.getItem('username') ?? '';
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap((response) => {
          this.saveToken(response.token);
          this.saveUsername(data.username);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (token) return true;
    else return false;
  }
}
