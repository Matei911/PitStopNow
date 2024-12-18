import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HostListener } from '@angular/core';
import { environment } from '../environment'


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  

  private urlLogin = environment.apiBaseUrl + '/users/login/';
  private urlLogout = environment.apiBaseUrl + '/users/logout/';

  constructor(private http: HttpClient, private router: Router) {
    window.onload = () => {
      console.log(sessionStorage);
      // if (sessionStorage.getItem("token")){
      //   history.replaceState(null, "", window.location.href);
      //   this.router.navigate(['/map']);
      // }
      // Logica ta aici
    };
  }

  onLogin() {

    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const payload = { username: this.username, password: this.password };

    this.http.post(this.urlLogin, payload).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        sessionStorage.setItem('username', this.username);
        sessionStorage.setItem("token", response["token"]);
        history.replaceState(null, "", window.location.href);
        this.router.navigate(['/map']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid username or password.';
      }
    });
  }

}