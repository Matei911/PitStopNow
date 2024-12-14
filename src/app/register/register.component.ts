import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
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

  dropdownOptions: { id: number; name: string }[] = [
    { id: 1, name: 'ProAuto Targu Jiu' },
    { id: 2, name: 'CLASAUTO SRL' },
    { id: 3, name: 'Bosch Car Service' },
    { id: 4, name: 'M-Auto' },
    { id: 5, name: 'Euromaster Ascet' },
    { id: 6, name: 'Dacia Lazar Service' },
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

    // Validate Service ID if a service is selected
    if (this.service) {
      const selectedService = this.dropdownOptions.find(option => option.name === this.service);
      if (!selectedService || parseInt(this.serviceId) !== selectedService.id) {
        this.message = `Invalid Service ID for the selected service`;
        return;
      }
    }

    this.message = 'You have successfully registered (this is a mock test).';
  }
}
