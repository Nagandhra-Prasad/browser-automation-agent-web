import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  list(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  setActive(userId: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}/active`, {
      is_active: isActive,
    });
  }
}
