import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { HostListener } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [CommonModule]
})
export class AdminComponent implements OnInit {
  employeeName: string = ""; // Replace with dynamic data if needed

  // Reservations categories
  unprocessedReservations: any[] = [];
  acceptedReservations: any[] = [];
  finishedReservations: any[] = [];

  constructor(private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef) {} // Inject Router here

  ngOnInit() {
    this.http
      .get(environment.apiBaseUrl + '/services/name/' + sessionStorage.getItem("serviceId") ).subscribe({
          next: (response: any) => {
            this.employeeName = response['name'];
            console.log('Service name:',  response['name']);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('ERROR: ', error);
          }
        });

    this.http.get(environment.apiBaseUrl + '/reservations/service/' + sessionStorage.getItem("serviceId")).subscribe({
      next: (response: any) => {
        response["reservations"].forEach((element: any) => {
          if (element["status"] === "pending") {
            this.unprocessedReservations.push(element);
          } else if (element["status"] === "accepted") {
            this.acceptedReservations.push(element);
          }
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ERROR: ', error);
      }
    });

    this.http.get(environment.apiBaseUrl + '/history/service/' + sessionStorage.getItem("serviceId")).subscribe({
          next: (response: any) => {
            this.finishedReservations = response['history'];
            console.log('History: ',  response['history']);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('ERROR: ', error);
          }
        });
  }
  

  // Actions for Unprocessed Reservations
  acceptReservation(index: number) {
    const reservation = this.unprocessedReservations.splice(index, 1)[0];
    this.http.put(environment.apiBaseUrl + '/reservations/service/accept/' + reservation['id'], {}).subscribe({
      next: (response: any) => {
        console.log('Reservation accepted:', response);
      },
      error: (error) => {
        console.error('ERROR: ', error);
      }
    });
    this.acceptedReservations.push(reservation);
    this.cdr.detectChanges();
  }

  rejectReservation(index: number) {
    const reservation = this.unprocessedReservations.splice(index, 1)[0];
    this.http.put(environment.apiBaseUrl + '/reservations/service/delete/' + reservation['id'], {}).subscribe({
      next: (response: any) => {
        console.log('Reservation rejected!');
      },
      error: (error) => {
        console.error('ERROR: ', error);
      }
    });
    this.cdr.detectChanges();
  }

  // Actions for Accepted Reservations
  cancelReservation(index: number) {
    const reservation = this.acceptedReservations.splice(index, 1)[0];
    this.http.put(environment.apiBaseUrl + '/reservations/service/delete/' + reservation['id'], {}).subscribe({
      next: (response: any) => {
        console.log('Reservation canceled!');
      },
      error: (error) => {
        console.error('ERROR: ', error);
      }
    });
    this.cdr.detectChanges();
  }

  finishReservation(index: number) {
    const reservation = this.acceptedReservations.splice(index, 1)[0];
    this.http.post(environment.apiBaseUrl + '/reservations/service/finish/' + reservation['id'], {}).subscribe({
      next: (response: any) => {
        console.log('Reservation finished!');
      },
      error: (error) => {
        console.error('ERROR: ', error);
      }
    });
    this.finishedReservations.push(reservation);
    this.cdr.detectChanges();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToAppointments(): void {
    this.router.navigate(['/admin']);
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
      sessionStorage.removeItem("serviceId");
      sessionStorage.removeItem("username");
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
