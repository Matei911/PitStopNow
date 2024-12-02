import { Component, OnInit, ElementRef } from '@angular/core';
import esriConfig from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Set the API key for accessing ArcGIS Online
    esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurIobXHsLq6aEcBZvlyrg7oOg9_g5fMynEoAhmzWDMFk4utg7tdzgxaar81plpPR_MuXAQX0pIna7ioSpsuGrhLqL2_8-Uds9zcmbXvIzqZ387ws9xFIwi7uinhVCW0hq5FQjxIJ_fL6gMDASSDwKdYPsZOmD4jP2pTkf9xRx1Tkzyubxm_81ufori67YF9mNQRlLOpsfQhWTxV_j_d4qK8U.AT1_LEkY6vXE';

    // Create a new Map
    const map = new Map({
      basemap: 'arcgis-topographic' // Use the desired basemap
    });

    // Create a MapView and set its container to the div in the HTML
    const view = new MapView({
      container: this.elementRef.nativeElement.querySelector('#mapViewDiv'), // Reference to the map container
      map: map,
      center: [23.274, 45.035], // Longitude, latitude
      zoom: 15 // Zoom level
    });
  }
}
