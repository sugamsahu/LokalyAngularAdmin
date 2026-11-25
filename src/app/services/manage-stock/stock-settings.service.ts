import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class StockSettingsService {
  constructor(private ajaxService: AjaxService) { }

  getItemListForStock(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'store/items_lists_for_stock');
  }

  getItemUnitList(): Observable<any> {
    return this.ajaxService.get('store/item_unit_list');
  }

  getUnitConversionList(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'admin/item_unit_conversion_list')
  }

  updateStockSettingsData(data: {}): Observable<any> {
    return this.ajaxService.post2(data, 'store/multiple_item_stock')
  }
}