import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent {
    // Selected Date, Service, and Time
    selectedDate: string | null = null;
    selectedService: string | null = null;
    selectedTime: string | null = null;
  
    // Service Options
    services: string[] = [
      'Intretinere periodica',
      'Reparatii mecanice',
      'Diagnosticare electronica',
      'Anvelope și geometrie roti',
      'ITP',
    ];
  
    // Hourly Time Slots (8:00 to 17:00)
    timeSlots: string[] = this.generateHourlyTimeSlots(8, 17);
  
    /**
     * Generate time slots dynamically between startHour and endHour
     */
    private generateHourlyTimeSlots(startHour: number, endHour: number): string[] {
      const slots: string[] = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        slots.push(`${hour}:00`);
      }
      return slots;
    }
  
    /**
     * Confirm Appointment: Logs a summary to the console
     */
    confirmAppointment(): void {
      if (this.selectedDate && this.selectedService && this.selectedTime) {
        console.log(
          `Appointment Confirmed:\nDate: ${this.selectedDate}\nService: ${this.selectedService}\nTime: ${this.selectedTime}`
        );
        alert(
          `Appointment Confirmed:\nDate: ${this.selectedDate}\nService: ${this.selectedService}\nTime: ${this.selectedTime}`
        );
      } else {
        alert('Please select a date, service, and time slot to confirm the appointment.');
      }
    }
}