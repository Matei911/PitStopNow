import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThisReceiver } from '@angular/compiler';
import { environment } from '../environment'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  fullName: string = '';
  email: string = '';
  phone: string = '';
  service: string = '';
  serviceId: string = '';
  message: string = '';

  private urlRegisterUser = environment.apiBaseUrl + '/users/register/user/';
  private urlRegisterUserService = environment.apiBaseUrl + '/users/register/service/';
  
  constructor(private http: HttpClient, private router: Router) {}

  dropdownOptions: { id: number; name: string }[] = [
    { id: 5, name: 'ProAuto Targu Jiu' },
    { id: 6, name: 'CLASAUTO SRL' },
    { id: 3, name: 'Bosch Car Service' },
    { id: 4, name: 'M-Auto' },
    { id: 7, name: 'Euromaster Ascet' },
    { id: 8, name: 'Dacia Lazar Service' },
  ];

  onRegister() {
    if (
      !this.username.trim() ||
      !this.fullName.trim() ||
      !this.password.trim() ||
      !this.confirmPassword.trim() ||
      !this.email.trim() ||
      !this.phone.trim()
    ) {
      this.message = 'Please fill out all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    let user: Record<string, any> = { username: this.username, password: this.password,
      name: this.fullName, email: this.email, phone: this.phone };

    if (this.service) {
      const selectedService = this.dropdownOptions.find(option => option.name === this.service);
      if (selectedService)
      {
        user["id_service"] = selectedService.id;
        user["nameService"] = selectedService.name;

        this.http.post(this.urlRegisterUserService, user).subscribe({
          next: (response: any) => {
            console.log('Service registration successful:', response);
            this.message = 'User Service registration successful.';
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Service registration error:', error);
            this.message = 'Service registration failed.';
          }
        });
      }
    }
    else {
      this.http.post(this.urlRegisterUser, user).subscribe({
        next: (response: any) => {
          console.log('User registration successful:', response);
          this.message = 'User registration successful.';
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('User registration error:', error);
          this.message = 'User registration failed.';
        }
      });
    }

    
    
  }
}
