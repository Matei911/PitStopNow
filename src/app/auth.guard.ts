import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (!sessionStorage.getItem('token') || !sessionStorage.getItem('role')) {
    router.navigate(['/login']);
    return false;
  }
  
  if(!route.data['roles'].includes(sessionStorage.getItem('role'))) {
    alert('You do not have permission to access this page.');
    return false;
  }

  return true;
};