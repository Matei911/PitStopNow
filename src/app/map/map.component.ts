import { Component, OnInit, ElementRef } from '@angular/core';
import esriConfig from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [CommonModule],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  trustedPartners = [
    {
      name: 'ProAuto Targu Jiu',
      logo: 'logoProAuto.png',
      rating: 4.5,
      address: 'Calea București 66, Târgu Jiu',
      distance: 2
    },
    {
      name: 'CLASAUTO SRL',
      logo: 'class-auto.png',
      rating: 4.5,
      address: 'Strada Dobrogeanu Gherea 2B, Târgu Jiu',
      distance: 2
    },
    {
      name: 'Bosch Car Service',
      logo: 'bosch-service-logo.png',
      rating: 4.5,
      address: 'Strada Barajului 8A, Târgu Jiu',
      distance: 2
    },
    {
      name: 'M-Auto',
      logo: 'mauto.png',
      rating: 4.5,
      address: 'Strada Tismana nr.71, Târgu Jiu',
      distance: 2
    },
    {
      name: 'Euromaster Ascet',
      logo: 'logoEuromaster.png',
      rating: 4.5,
      address: 'Strada Termocentralei 20, Târgu Jiu',
      distance: 2
    },
    {
      name: 'Dacia Lazar Service',
      logo: 'logo_s_w.png',
      rating: 4.5,
      address: 'Aleea Victoriei 1, Târgu Jiu',
      distance: 2
    }
  ];

  constructor(private elementRef: ElementRef, private router: Router) {}

  ngOnInit(): void {
    // Set the API key for accessing ArcGIS Online
    esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurIobXHsLq6aEcBZvlyrg7oOg9_g5fMynEoAhmzWDMFk4utg7tdzgxaar81plpPR_MuXAQX0pIna7ioSpsuGrhLqL2_8-Uds9zcmbXvIzqZ387ws9xFIwi7uinhVCW0hq5FQjxIJ_fL6gMDASSDwKdYPsZOmD4jP2pTkf9xRx1Tkzyubxm_81ufori67YF9mNQRlLOpsfQhWTxV_j_d4qK8U.AT1_LEkY6vXE';

    // Create a new Map
    const map = new Map({
      basemap: 'streets-navigation-vector' // Use the desired basemap
    });

    // Create a MapView and set its container to the div in the HTML
    const view = new MapView({
      container: this.elementRef.nativeElement.querySelector('#mapViewDiv'), // Reference to the map container
      map: map,
      center: [23.274, 45.035], // Longitude, latitude
      zoom: 13 // Zoom level
    });
  }
    // Navigate to the profile page
    goToProfile(): void {
      this.router.navigate(['/profile']); // Use the router to navigate to the profile page
    }
  
    // Navigate to the appointments page
    goToAppointments(): void {
      this.router.navigate(['/appointments']); // Use the router to navigate to appointments
    }
}
