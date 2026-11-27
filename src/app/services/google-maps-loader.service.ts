import { Injectable } from "@angular/core";

/**
 * Waits until the Google Maps JavaScript API is ready.
 *
 * index.html loads the API (with the places library) once, asynchronously.
 * Components that use google.maps directly (geocoder, autocomplete, their own
 * map) call load() first. This replaces MapsAPILoader from @agm/core, which
 * loaded a second copy of the same script.
 */
@Injectable({ providedIn: "root" })
export class GoogleMapsLoader {
  private ready?: Promise<void>;

  load(): Promise<void> {
    if (!this.ready) {
      this.ready = new Promise<void>((resolve, reject) => {
        const started = Date.now();
        const check = () => {
          const w = window as any;
          if (w.google && w.google.maps && w.google.maps.places) {
            resolve();
          } else if (Date.now() - started > 30000) {
            this.ready = undefined; // allow a later retry
            reject(new Error("Google Maps did not load"));
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }
    return this.ready;
  }
}
