import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], // Add FormsModule here
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
  message: string = '';

  onRegister() {
    this.message = 'You have successfully registered (this is a mock test).';
  }
}