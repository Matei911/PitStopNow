import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  if (!sessionStorage.getItem('token')) {
    router.navigate(['/login']);
    return false;
  }
  ///users/role/{token} 
  http.get(environment.apiBaseUrl + '/users/role/' + sessionStorage.getItem('token')).subscribe({
    next: (response: any) => {
      if (!route.data['roles'].includes(response['role'])) {
        router.navigate(['/login']);
        sessionStorage.removeItem('token');
        return false;
      }
      return true;
    }
  });
  return true;
};