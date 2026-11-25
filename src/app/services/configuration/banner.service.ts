import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { AjaxService } from '../ajax.service';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  constructor(private _ajaxService: AjaxService) { }

  getBannerList(data: {}): Observable<any> {
    return this._ajaxService.post2(data, 'admin/global_banners');
  }

  deleteGlobalBanner(data: {}): Observable<any> {
    return this._ajaxService.post(data, 'admin/delete_global_banner');
  }

  getCategoryWiseItem(data: {}): Observable<any> {
    return this._ajaxService.post(data, 'admin/category_wise_items');
  } 

  getOffersList(data: {}): Observable<any> {
    return this._ajaxService.post2(data, 'store/offers_list');
  }

  manageGlobalBanner(data: {}): Observable<any> {
    return this._ajaxService.formData2(data, 'admin/manage_global_banner');
  }

  getHelpList(data: {}): Observable<any> {
    return this._ajaxService.post2(data, 'admin/helps');
  }

  getHelpById(data: {}): Observable<any> {
    return this._ajaxService.post2(data, 'admin/get_helps_by_id');
  }

  getManageHelps(data: {}): Observable<any> {
    return this._ajaxService.formData2(data, 'admin/manage_helps');
  }

  updateChatCount(data: {}): Observable<any> {
    return this._ajaxService.post2(data, 'user/update_chat_count');
  }

  sendChatNotification(data: {}): Observable<any> {
    return this._ajaxService.post2(data, 'user/chat_nofication_send');
  }
}