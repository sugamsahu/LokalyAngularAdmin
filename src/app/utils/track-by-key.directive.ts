import { Directive, Host, Input } from '@angular/core';
import { NgForOf } from '@angular/common';

/**
 * Lets an *ngFor track rows by an ID field instead of by object:
 *
 *   <tr *ngFor="let order of orderList; trackByKey: 'order_id'">
 *
 * Without it, every reload from the API gives new objects, so Angular removes
 * and rebuilds every row. With it, rows whose ID is still there are kept and
 * only their changed values are updated. A row without the field falls back to
 * the normal tracking by object.
 */
@Directive({
  selector: '[ngForTrackByKey]',
  standalone: true,
})
export class TrackByKeyDirective<T> {
  constructor(@Host() private ngFor: NgForOf<T>) {}

  @Input() set ngForTrackByKey(key: string) {
    this.ngFor.ngForTrackBy = (_index: number, item: any) =>
      item != null && item[key] != null ? item[key] : item;
  }
}
