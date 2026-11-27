import { QueryList } from "@angular/core";
import { GoogleMap, MapInfoWindow, MapMarker } from "@angular/google-maps";

/**
 * Shared behaviour for maps that show a list of markers with one info window
 * (order list map view, driver tracking). It replaces what @agm/core did:
 * fitting the map to all markers ([fitBounds] / [agmFitBounds]) and opening the
 * selected marker's info window ([isOpen]).
 *
 * Marker positions and options are cached per item, so Angular's change
 * detection does not recreate them (and reset the markers) on every check.
 */
export class MarkerMap<T extends object> {
  private cache = new WeakMap<T, { key: string; position: google.maps.LatLngLiteral; options: google.maps.MarkerOptions }>();

  constructor(
    private positionOf: (item: T) => { lat: any; lng: any },
    private iconUrlOf: (item: T) => string | null,
  ) {}

  private entry(item: T) {
    const p = this.positionOf(item);
    const position = { lat: Number(p.lat), lng: Number(p.lng) };
    const url = this.iconUrlOf(item);
    const key = `${position.lat},${position.lng},${url}`;
    let e = this.cache.get(item);
    if (!e || e.key !== key) {
      e = {
        key,
        position,
        // 25 x 35 px, the size the AGM markers used
        options: url ? { icon: { url, scaledSize: new google.maps.Size(25, 35) } } : {},
      };
      this.cache.set(item, e);
    }
    return e;
  }

  position(item: T): google.maps.LatLngLiteral {
    return this.entry(item).position;
  }

  options(item: T): google.maps.MarkerOptions {
    return this.entry(item).options;
  }

  /** Fits the map to all items with a valid position. */
  fit(map: GoogleMap | undefined, items: T[]): void {
    if (!map || !map.googleMap || !items || !items.length) {
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    for (const item of items) {
      const p = this.position(item);
      if (isFinite(p.lat) && isFinite(p.lng)) {
        bounds.extend(p);
        count++;
      }
    }
    if (count === 1) {
      map.googleMap.setCenter(bounds.getCenter());
    } else if (count > 1) {
      map.fitBounds(bounds);
    }
  }

  /** Opens the info window on the marker at index, once the markers have rendered. */
  open(infoWindow: MapInfoWindow | undefined, markers: QueryList<MapMarker> | undefined, index: number): void {
    setTimeout(() => {
      const marker = markers && markers.get(index);
      if (infoWindow && marker) {
        infoWindow.open(marker);
      }
    });
  }
}
