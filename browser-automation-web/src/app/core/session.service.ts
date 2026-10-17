import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/api.models';

const USER_KEY = 'baa_current_user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userSubject = new BehaviorSubject<User | null>(this.readStored());
  readonly user$ = this.userSubject.asObservable();

  get user(): User | null {
    return this.userSubject.value;
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  patchUser(partial: Partial<User>): void {
    const current = this.user;
    if (!current) {
      return;
    }
    this.setUser({ ...current, ...partial });
  }

  clear(): void {
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  private readStored(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
