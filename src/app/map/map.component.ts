import { Component, OnInit, ElementRef } from '@angular/core';
import esriConfig from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import * as locator from '@arcgis/core/rest/locator';
import MapView from '@arcgis/core/views/MapView';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HostListener } from '@angular/core';
import { environment } from '../environment';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [CommonModule, HttpClientModule],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  trustedPartners: any[] = [];

  constructor(private elementRef: ElementRef, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    esriConfig.request.proxyUrl = environment.apiBaseUrl + '/proxy/';
    const map = new Map({
      basemap: 'streets-navigation-vector'
    });

    const view = new MapView({
      container: this.elementRef.nativeElement.querySelector('#mapViewDiv'),
      map: map,
      center: [23.274, 45.035],
      zoom: 13
    });

    this.http.get(environment.apiBaseUrl + '/services/get/').subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Login error:', error);
      }
    });

  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  // private urlLogout = environment.apiBaseUrl + '/logout/';

  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: Event) {
  //   const payload = JSON.stringify({ token: sessionStorage.getItem("token") });

  //   if (navigator.sendBeacon) {
  //     const success = navigator.sendBeacon(this.urlLogout, payload);
  //     if (!success) {
  //       console.error('Logout beacon failed to send.');
  //     }
  //   } else {
  //     console.warn('sendBeacon not supported by this browser.');
  //   }
  // }
}
