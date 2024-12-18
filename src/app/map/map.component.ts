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
import Point from '@arcgis/core/geometry/Point';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [CommonModule],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  ServicesGraphicLayer: GraphicsLayer = new GraphicsLayer();
  trustedPartners: any[] = [];
  mapView!: MapView;
  highlightedPartnerIndex: number | null = null;
  currentCenteredPartner: any = null;
  private activePopup: HTMLElement | null = null;
  userLocationLayer: GraphicsLayer = new GraphicsLayer(); // Layer for user location
  userLocation: Point | null = null; // Store user location
  isLocationAvailable: boolean = false;
  showPopup: boolean = true; 
  stars: number[] = [1, 2, 3, 4, 5];
  hoverIndex: number = 0;
  currentRating: number = 0;

  constructor(private elementRef: ElementRef, private router: Router, private http: HttpClient) {}
  //PopUp related methods
  dismissPopup(): void {
    this.showPopup = false; // Hide the popup
  }
  setHoverIndex(index: number): void {
    this.hoverIndex = index;
  }

  clearHoverIndex(): void {
    this.hoverIndex = 0;
  }

  setRating(index: number): void {
    this.currentRating = index;
    console.log(`User selected rating: ${this.currentRating}`);
  }
  //
  ngOnInit(): void {
    this.http.get(environment.apiBaseUrl + '/reservations/check/' + sessionStorage.getItem("token")).subscribe({
      next: (response: any) => {
        let status : string = response["status"];
        if (status === "Reservation Done!")
        {
          console.log("Reservation");
        }
      },
      error: (error) => {
        console.error('ERROR:', error);
      }
    })

    // Create two Promises for synchronization
    const partnersPromise = new Promise<void>((resolve) => {
      this.http.get(environment.apiBaseUrl + '/services/get/').subscribe({
        next: (response: any) => {
          this.trustedPartners = response;
          resolve(); // Partner data is loaded
        },
        error: (error) => {
          console.error('ERROR:', error);
          resolve(); // Resolve to avoid blocking if error occurs
        }
      });
    });
  
    const mapPromise = new Promise<MapView>((resolve) => {
      esriConfig.request.proxyUrl = environment.apiBaseUrl + '/proxy/';
  
      const map = new Map({
        basemap: 'streets-navigation-vector'
      });
  
      map.add(this.ServicesGraphicLayer);
      map.add(this.userLocationLayer);
  
      const view = new MapView({
        container: this.elementRef.nativeElement.querySelector('#mapViewDiv'),
        map: map,
        center: [23.274, 45.035],
        zoom: 13,
      });

      view.popup.highlightEnabled = false;
  
      view.when(() => {
        resolve(view); // Map is ready
      });
    });
  
    // Synchronize both Promises
    Promise.all([partnersPromise, mapPromise]).then(([_, view]) => {
      this.mapView = view;
      this.displayServices(); // Call displayServices with the ready MapView
      this.displayUserLocation();

      this.mapView.on("drag", () => {
        if (this.activePopup) {
            this.activePopup.remove();
            this.activePopup = null;
        }
      });

    // Remove popups when zooming via mouse wheel
    this.mapView.on("mouse-wheel", () => {
        if (this.activePopup) {
            this.activePopup.remove();
            this.activePopup = null;
        }
      });

    // Remove popups when the map is no longer stationary
    this.mapView.watch('stationary', (isStationary) => {
        if (!isStationary && this.activePopup) {
            this.activePopup.remove();
            this.activePopup = null;
        }
      });
    });
  }

  scrollToPartner(index: number): void {
    const container = this.elementRef.nativeElement.querySelector('#leftContent');
    const partnerElement = container.querySelectorAll('.box')[index];
    if (partnerElement) {
        partnerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.highlightPartner(index);
    }
}

displayUserLocation(): void {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Store the user's location
          this.userLocation = new Point({
              longitude: longitude,
              latitude: latitude
          });

          // Remove existing user location graphic
          this.userLocationLayer.removeAll();

          // Add a blue dot for the user's location
          const userGraphic = new Graphic({
            geometry: this.userLocation,
            symbol: new SimpleMarkerSymbol({
                color: [0, 0, 255, 0.7], // Blue with transparency
                size: "12px",
                outline: {
                    color: "white",
                    width: 1
                }
            })
        });

          this.userLocationLayer.add(userGraphic);

          // Center the map on the user's location
          this.mapView.goTo({
              target: this.userLocation,
              zoom: 15
          });
          this.isLocationAvailable = true;
          console.log("User location displayed:", this.userLocation);
          this.trustedPartners = this.trustedPartners.map((partner) => {
            const distance = this.calculateDistance(
                latitude,
                longitude,
                partner.latitude,
                partner.longitude
            );
            return { ...partner, distance: distance.toFixed(2) }; // Add distance field
        });
      }, (error) => {
          console.error("Error fetching location:", error);
          this.isLocationAvailable = false;
      });
  } else {
      console.error("Geolocation is not supported by this browser.");
      this.isLocationAvailable = false;
  }
}

calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

goToCurrentLocation(): void {
  if (this.userLocation) {
      this.mapView.goTo({
          target: this.userLocation,
          zoom: 17
      });
  } else {
      // Fetch and display user location if not already fetched
      this.displayUserLocation();
  }
}

highlightPartner(index: number): void {
    this.highlightedPartnerIndex = index;
}
  

  displayServices(): void {
    this.ServicesGraphicLayer.removeAll();
    for (const partner of this.trustedPartners) {
        if (partner["error"]) continue;

        const longitude = partner.longitude;
        const latitude = partner.latitude;

        // Determine marker color based on availability
        const markerColor = partner.available ? 'green' : 'darkgray';

        // Create a point graphic
        const pointGraphic = new Graphic({
            geometry: new Point({
                longitude: longitude,
                latitude: latitude
            }),
            symbol: new SimpleMarkerSymbol({
                color: markerColor, // Green for available, dark gray for unavailable
                size: '10px',
                outline: {
                    color: 'white',
                    width: 1
                }
            }),
            attributes: {
                Name: partner.name,
                Address: partner.address,
                Rating: partner.rating,
                Available: partner.available ? 'Yes' : 'No',
                index: this.trustedPartners.indexOf(partner)
            }
        });

        this.ServicesGraphicLayer.add(pointGraphic);
    }

    // Add click event listener
    this.mapView.on("click", (event: any) => {
      this.mapView.hitTest(event).then((response: any) => {
          // Check if a graphic was clicked
          const graphic = response.results.find((result: any) => result.graphic.layer === this.ServicesGraphicLayer)?.graphic;

          if (this.activePopup) {
            this.activePopup.remove();
            this.activePopup = null;
          }
  
          if (graphic) {
              const attributes = graphic.attributes;
              const popupContent = this.createPopupContent(attributes);
  
              // Show the popup
              const popup = document.createElement('div');
              popup.innerHTML = popupContent;
              popup.style.position = 'absolute';
              popup.style.top = `${event.y}px`;
              popup.style.left = `${event.x}px`;
              popup.style.backgroundColor = 'white';
              popup.style.padding = '10px';
              popup.style.boxShadow = '0px 4px 8px rgba(0,0,0,0.2)';
              popup.style.borderRadius = '8px';
              popup.style.fontFamily = 'Arial, sans-serif';
              popup.style.fontSize = '14px';
              popup.style.color = '#444';
  
              // Append to the map container
              const mapViewContainer = this.elementRef.nativeElement.querySelector('#mapViewDiv');
              mapViewContainer.appendChild(popup);
              this.activePopup = popup;
  
              // Remove the popup when clicking outside
              mapViewContainer.addEventListener('click', () => {
                  if (popup) {
                      popup.remove();
                  }
              }, { once: true });
              const index = graphic.attributes.index;
              this.scrollToPartner(index);
          }
      });
  });
}

createPopupContent(attributes: any): string {
    const { Name, Address, Rating, Available } = attributes;
    const availabilityColor = Available === 'Yes' ? 'green' : 'red';

    return `
        <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${Name}</h3>
        <p><strong>Address:</strong> ${Address}</p>
        <p><strong>Rating:</strong> ★ ${Rating} stars</p>
        <p><strong>Available:</strong> <span style="color: ${availabilityColor};">${Available}</span></p>
        ${Available === 'Yes' ? `<button style="padding: 8px 12px; background-color: green; color: white; border: none; border-radius: 4px; cursor: pointer;">Reserve</button>` : ''}
    `;
}


centerMap(partner: any): void {
  // Find the corresponding graphic in the GraphicsLayer
  const targetGraphic = this.ServicesGraphicLayer.graphics.find((graphic: any) => {
      return graphic.attributes.Name === partner.name;
  });

  if (targetGraphic) {
      // Center the map on the graphic's geometry
      this.mapView.goTo({
          target: targetGraphic.geometry,
          zoom: 17
      }).then(() => {
          this.currentCenteredPartner = partner;
      });
      const index = this.trustedPartners.findIndex((p) => p.name === partner.name);
      this.highlightPartner(index);
  } else {
      console.warn('Graphic not found for the given partner.');
  }
}

  
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  goToReserve(partner : any): void {
    // console.log(partner.id)
    this.router.navigate(['/reserve'],{ queryParams: { serviceId: partner.id, name: partner.name} } );
  }

  // private urlLogout = environment.apiBaseUrl + '/logout/';

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
