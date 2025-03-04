import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MapComponent } from './map/map.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './auth.guard';
import { ReserveComponent } from './reserve/reserve.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'map', component: MapComponent, canActivate: [authGuard], data: { roles: ['user'] } },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [authGuard], data: { roles: ['user'] } },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard], data: { roles: ['user', 'service']} },
  {path: 'reserve', component: ReserveComponent, canActivate: [authGuard], data: { roles: ['user'] } },
  {path: 'admin', component: AdminComponent, canActivate: [authGuard], data: { roles: ['service'] } }
];
