import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../environment';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reserve',
  imports: [FormsModule, CommonModule],
  templateUrl: './reserve.component.html',
  styleUrl: './reserve.component.css'
})
export class ReserveComponent {
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

   // Selected Date, Service, and Time
   nameService: string = "";
   serviceId: number = 0;
   selectedDate: string | null = null;
   selectedService: string | null = null;
   selectedTime: string | null = null;
   timeSlots: string[] = [];
   today: string = ""; // Holds today's date for the 'min' attribute
   maxDate: string = ""; // Holds the date 2 weeks from now

  ngOnInit(): void {
    this.setDateLimits();
    this.route.queryParams.subscribe(params => {
      this.serviceId = params['serviceId'];
      this.nameService = params['name'];
      // console.log('Service ID:', serviceId);
    });
  }
  setDateLimits() {
    const currentDate = new Date();

    // Today's Date
    this.today = currentDate.toISOString().split('T')[0];

    // Calculate Two Weeks Ahead
    const twoWeeksAhead = new Date();
    twoWeeksAhead.setDate(currentDate.getDate() + 14); // Add 14 days
    this.maxDate = twoWeeksAhead.toISOString().split('T')[0];
  }

  // Service Options
  services: string[] = [
    'Intretinere periodica',
    'Reparatii mecanice',
    'Diagnosticare electronica',
    'Anvelope și geometrie roti',
    'ITP',
  ];


  async onDateChange() {
    if (this.selectedDate) {
      this.timeSlots = await this.get_free_timeslots();
      console.log('Time Slots:', this.timeSlots);
    }
  }

  // Metodă pentru a obține datele din server
  private async get_free_timeslots(): Promise<string[]> {
    try {
      const response = await this.http
        .get<string[]>(`${environment.apiBaseUrl}/reservations/free/${this.serviceId}/${this.selectedDate}`)
        .toPromise();
      return response || [];
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [''];
    }
  }

  /**
   * Confirm Appointment: Logs a summary to the console
   */
  confirmAppointment(): void {
    if (this.selectedDate && this.selectedService && this.selectedTime) {
      const payload = { data : this.selectedDate, ora : this.selectedTime, id_service : this.serviceId,
        tip_programare : this.selectedService, token : sessionStorage.getItem("token")
      }
      
      this.http.post(environment.apiBaseUrl + "/reservations/add/", payload).subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          console.log(
            `Appointment Confirmed:\nDate: ${this.selectedDate}\nService: ${this.selectedService}\nTime: ${this.selectedTime}`
          );
          alert(
            `Appointment Confirmed:\nDate: ${this.selectedDate}\nService: ${this.selectedService}\nTime: ${this.selectedTime}`
          );
          
        },
        error: (error) => {
          if (error['error']["detail"] == "Userul are deja o programare in curs"){
            alert("You already have an ongoing appointment.")
          }
          console.error('ERROR:', error);
        }
      })
      
      this.router.navigate(['/map']);
    } else {
      alert('Please select a date, service, and time slot to confirm the appointment.');
    }
  }



  goBack() {
    this.router.navigate(['/map']) 
  }


  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: Event) {
  //   const payload = JSON.stringify({ token: sessionStorage.getItem("token") });

  //   if (navigator.sendBeacon) {
  //     const success = navigator.sendBeacon(environment.apiBaseUrl + '/users/logout/', payload);
  //     if (!success) {
  //       console.error('Logout beacon failed to send.');
  //     }
  //   } else {
  //     console.warn('sendBeacon not supported by this browser.');
  //   }
  // }
}
