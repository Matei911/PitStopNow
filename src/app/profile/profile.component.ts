import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../environment'
import { HttpClient } from '@angular/common/http';
import { HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ProfileComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}

  profileImage: string | null = null;
  username: string = '';
  password: string = '';
  confirmPassword: string = ''; // Added for password confirmation
  serviceId: string | null = null;
  fullName: string = '';
  phone: string = '';
  email: string = '';
  currentPassword: string = ''; // Added to store current password input
  isEditing: boolean = false;

  passwordError: string = ''; // Error message for password validation

  ngOnInit(): void {
    this.http
      .get(environment.apiBaseUrl + "/users/" + sessionStorage.getItem("token"))
      .subscribe({
        next: (response: any) => {
          this.username = response["username"];
          this.password = ''; // Don't prefill password for security
          if (response["id_service"] === "")
            this.serviceId = null;
          else
            this.serviceId = response["id_service"];
          this.fullName = response["name"];
          this.phone = response["phone"];
          this.email = response["email"];
        },
        error: (error) => {
          console.error("ERROR: ", error);
        },
      });

    const storedImage = localStorage.getItem(`profileImage_${this.username}`);
    if (storedImage) {
      this.profileImage = storedImage;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target) {
          this.profileImage = e.target.result as string;
          localStorage.setItem(`profileImage_${this.username}`, this.profileImage);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  enableEditing(): void {
    this.isEditing = true;
    this.passwordError = '';
    this.password = '';
    this.confirmPassword = '';
    this.currentPassword = ''; // Reset current password field
  }

  saveChanges(): void {
    // Check if current password is provided
    if (!this.currentPassword) {
      this.passwordError = 'Please enter your current password.';
      return;
    }

    // Validate the password confirmation
    if (this.password || this.confirmPassword) {
      if (this.password.length < 8) {
        this.passwordError = 'Password must be at least 8 characters.';
        return;
      }
      //must contain at leat one special character
      if (!/[!@#$%^&*]/.test(this.password)) {
        this.passwordError = 'Password must contain at least one special character.';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.passwordError = 'Passwords do not match.';
        return;
      }
    }

    // Prepare payload
    const payload = {
      username: this.username,
      password: this.password, // Password will only be sent if updated
      serviceId: this.serviceId,
      name: this.fullName,
      phone: this.phone,
      email: this.email,
    };

    // Make PUT request to update user data
    this.http
      .put(environment.apiBaseUrl + "/users/" + sessionStorage.getItem("token"), payload)
      .subscribe({
        next: () => {
          console.log("Profile updated successfully!");
          alert("Profile updated successfully!");
          this.isEditing = false;
        },
        error: (error) => {
          console.error("ERROR: ", error);
          this.passwordError = "Error updating profile. Please try again.";
        },
      });

    this.isEditing = false;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.passwordError = '';
    this.password = '';
    this.confirmPassword = '';
    this.currentPassword = ''; // Reset current password field
  }
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }
  goToMap(): void {
    this.router.navigate(['/map']);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    const payload = JSON.stringify({ token: sessionStorage.getItem("token") });

    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(environment.apiBaseUrl + '/users/logout/', payload);
      if (!success) {
        console.error('Logout beacon failed to send.');
      }
    } else {
      console.warn('sendBeacon not supported by this browser.');
    }

    sessionStorage.removeItem("token");
  }
}