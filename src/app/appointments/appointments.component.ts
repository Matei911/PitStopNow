import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../environment';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { HostListener } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent {
  constructor(private http: HttpClient, private router: Router) {}
  // Ongoing reservation data
  ongoingReservation = {
    title: '',
    date: '',
    time: '',
    location: '',
    address: ''
  };

  // Appointment history data
  appointmentHistory: { title: string; date: string; time: string; location: string ; address: string}[] = [];
  ngOnInit(): void{
    this.http.get(environment.apiBaseUrl + "/reservations/" + sessionStorage.getItem("token")).subscribe({
      next : (response: any) =>{
        this.ongoingReservation.date = response["data"];
        this.ongoingReservation.title = response["title"];
        this.ongoingReservation.time = response["time"];
        this.ongoingReservation.location = response["name"];
        this.ongoingReservation.address = response["address"];
      },
      error: (error) => {
        console.log("ERROR :", error);
      }
    })

    this.http.get(environment.apiBaseUrl + "/history/" + sessionStorage.getItem("token")).subscribe({
      next : (response: any) =>{
        this.appointmentHistory.push({
          title : response["title"],
          date : response["data"],
          time : response["time"],
          location : response["name"],
          address : response["address"]
        });
        this.appointmentHistory = this.appointmentHistory.slice();
        console.log(this.appointmentHistory);
        console.log(response);
      },
      error: (error) => {
        console.log("ERROR :", error);
      }
    })
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