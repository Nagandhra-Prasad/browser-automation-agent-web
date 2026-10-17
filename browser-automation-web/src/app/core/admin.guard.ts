import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from './session.service';
import { TokenService } from './token.service';

export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const token = inject(TokenService);

  if (!token.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  if (session.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/app/dashboard']);
};
