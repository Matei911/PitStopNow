import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule],
})
export class ProfileComponent implements OnInit {
  profileImage: string | null = null;
  username: string = 'defaultUser'; // Într-un scenariu real, această valoare ar fi dinamică (de exemplu, obținută dintr-un serviciu de autentificare)

  ngOnInit(): void {
    // Recuperăm imaginea asociată utilizatorului curent
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

          // Salvăm imaginea asociată utilizatorului curent
          localStorage.setItem(`profileImage_${this.username}`, this.profileImage);
        }
      };

      reader.readAsDataURL(file);
    }
  }
}
