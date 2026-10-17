import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { SessionService } from '../core/session.service';
import { TokenService } from '../core/token.service';
import { ProfileUpdateRequest, RegisterRequest, TokenResponse, User } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly session = inject(SessionService);
  private readonly base = `${environment.apiUrl}/auth`;

  register(payload: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/register`, payload).pipe(
      tap((res) => {
        this.tokenService.setToken(res.access_token);
        this.session.setUser(res.user);
      }),
    );
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/login`, { email, password }).pipe(
      tap((res) => {
        this.tokenService.setToken(res.access_token);
        this.session.setUser(res.user);
      }),
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`).pipe(tap((user) => this.session.setUser(user)));
  }

  completeOnboarding(): Observable<User> {
    return this.http.post<User>(`${this.base}/onboarding-complete`, {}).pipe(
      tap((user) => this.session.setUser(user)),
    );
  }

  updateProfile(payload: ProfileUpdateRequest): Observable<User> {
    return this.http.patch<User>(`${this.base}/me`, payload).pipe(
      tap((user) => this.session.setUser(user)),
    );
  }

  logout(): void {
    this.tokenService.clear();
    this.session.clear();
  }
}
