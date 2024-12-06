import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ProfileComponent implements OnInit {
  profileImage: string | null = null;
  username: string = 'defaultUser';
  password: string = 'defaultPassword';
  serviceId: string = '12345';
  fullName: string = 'John Doe';
  phone: string = '0123456789';
  email: string = 'example@example.com';
  isEditing: boolean = false;

  ngOnInit(): void {
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
  }

  saveChanges(): void {
    // Într-un scenariu real, salvează datele într-un backend
    console.log('Modificări salvate:', {
      username: this.username,
      password: this.password,
      serviceId: this.serviceId,
      fullName: this.fullName,
      phone: this.phone,
      email: this.email,
    });
    this.isEditing = false;
  }

  cancelEditing(): void {
    // Resetează câmpurile (de exemplu, dintr-o copie a datelor inițiale)
    this.isEditing = false;
  }
}
