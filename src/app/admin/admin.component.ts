import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [CommonModule]
})
export class AdminComponent {
  employeeName = 'John Doe'; // Replace with dynamic data if needed

  // Reservations categories
  unprocessedReservations = [
    { type: 'ITP', time: '12:30', date: '25.06.2025', name: 'Traianis', phone: '0740123456' },
    { type: 'Anvelope și geometrie roti', time: '15:30', date: '24.07.2025', name: 'Traianis Udristioiu', phone: '0740123456'  },
    { type: 'Diagnosticare electronica', time: '13:00', date: '10.01.2025', name: 'Victor Eftenoiu', phone: '0740123456'  }
  ];
  acceptedReservations: any[] = [];
  finishedReservations: any[] = [];

  // Actions for Unprocessed Reservations
  acceptReservation(index: number) {
    const reservation = this.unprocessedReservations.splice(index, 1)[0];
    this.acceptedReservations.push(reservation);

  }

  rejectReservation(index: number) {
    this.unprocessedReservations.splice(index, 1);
  }

  // Actions for Accepted Reservations
  cancelReservation(index: number) {
    this.acceptedReservations.splice(index, 1);

  }

  finishReservation(index: number) {
    const reservation = this.acceptedReservations.splice(index, 1)[0];
    this.finishedReservations.push(reservation);
  }
}