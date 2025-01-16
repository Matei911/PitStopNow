import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ProfileComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }

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
  fromAdmin: boolean = false; // Flag to check if navigated from admin
  phoneError: string = ''; // Error message for phone number validation
  emailError: string = ''; // Error message for email validation

  ngOnInit(): void {
    this.http.get(environment.apiBaseUrl + '/users/role/' + sessionStorage.getItem('token')).subscribe({
      next: (response: any) => {
        this.fromAdmin = response['role'] == 'service' ? true : false;
      }
    });

    this.http
      .get(environment.apiBaseUrl + '/users/' + sessionStorage.getItem('token'))
      .subscribe({
        next: (response: any) => {
          this.username = response['username'];
          this.password = ''; // Don't prefill password for security
          this.serviceId =
            response['id_service'] === '' ? null : response['id_service'];
          this.fullName = response['name'];
          this.phone = response['phone'];
          this.email = response['email'];
        },
        error: (error) => {
          console.error('ERROR: ', error);
        },
      });

    const storedImage = sessionStorage.getItem("photo");
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
          const formData = new FormData();
          const customFileName = `profileImage_${this.username}.png`;
          const token = sessionStorage.getItem('token') || '';
          formData.append('file', file);
          formData.append('filename', customFileName);
          formData.append('token', token);

          // Trimiți fișierul la server
          this.http.post(environment.apiBaseUrl + "/users/upload_photo/", formData).subscribe({
            next: (response: any) => {
              console.log('Upload reușit:', response);
              sessionStorage.setItem('photo', customFileName);
            },
            error: (error) => {
              console.error('Eroare la upload:', error);
            }
          });
        }
      };

      reader.readAsDataURL(file);
    }
  }

  enableEditing(): void {
    this.isEditing = true;
    this.passwordError = '';
    // Do not reset password fields
  }
  
  saveChanges(): void {
    // Validate phone number (ensure it contains only numbers)
    if (!/^[0-9]*$/.test(this.phone)) {
      this.phoneError = 'Phone number must contain only numbers.';
      return;
    }

    // Validate email (ensure it contains @)
    if (!this.email.includes('@')) {
      this.emailError = 'Invalid email address.';
      return;
    }

    // Check if password fields are filled; otherwise, skip password validation
    if (this.password || this.confirmPassword) {
      if (this.password.length < 8) {
        this.passwordError = 'Password must be at least 8 characters.';
        return;
      }
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
    const payload: any = {
      username: this.username,
      serviceId: this.serviceId,
      name: this.fullName,
      phone: this.phone,
      email: this.email,
    };

    // Include password in payload only if it is provided
    if (this.password) {
      payload.password = this.password;
    }

    this.http
      .put(environment.apiBaseUrl + '/users/' + sessionStorage.getItem('token'), payload)
      .subscribe({
        next: () => {
          console.log('Profile updated successfully!');
          alert('Profile updated successfully!');
          this.isEditing = false;
        },
        error: (error) => {
          console.error('ERROR: ', error);
          this.passwordError = 'Error updating profile. Please try again.';
        },
      });

    this.isEditing = false;
    this.emailError = '';
    this.phoneError = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.passwordError = '';
    this.emailError = '';
    this.phoneError = '';
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
  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    const payload = JSON.stringify({ token: sessionStorage.getItem('token') });

    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(
        environment.apiBaseUrl + '/users/logout/',
        payload
      );
      if (!success) {
        console.error('Logout beacon failed to send.');
      }
    } else {
      console.warn('sendBeacon not supported by this browser.');
    }

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('photo');
    if ("service_name" in sessionStorage) {
      sessionStorage.removeItem('service_name');
    }
    if ("id_service_reservation" in sessionStorage) {
      sessionStorage.removeItem('id_service_reservation');
    }
    if ("serviceId" in sessionStorage) {
      sessionStorage.removeItem('serviceId');
    }
    sessionStorage.removeItem("username");
  }
}
