import { EventEmitter, Injectable, Output } from "@angular/core";
import { Observable } from "rxjs";
import { UserModel } from "../models/user.model";
import { AjaxService } from "./ajax.service";
import { CryptoService } from "./custom/crypto.service";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  @Output() aClickedEvent = new EventEmitter<string>();

  constructor(
    private ajaxService: AjaxService,
    private cryptoService: CryptoService
  ) { }

  AClicked(msg: string) {
    this.aClickedEvent.emit(msg);
  }

  public getUserRoleName() {
    let userData = JSON.parse(localStorage.getItem("loginUser"));
    let role =
      userData?.role_id == 1 || userData?.role_id == 6 ? "admin" : "store";
    return role;
  }

  public getCurrentUserFromLocalStorage(): UserModel | undefined {
    try {
      const lsValue = localStorage.getItem("LoginUserDetails");
      if (!lsValue) {
        return undefined;
      }

      const userData = JSON.parse(lsValue);
      return userData;
    } catch (error) {
      return undefined;
    }
  }

  getSessionLoginUserStore() {
    var loginUserStore = new Object();
    if (typeof Storage !== "undefined") {
      loginUserStore = localStorage.getItem("loginUserStore");
    } else {
      // Sorry! No Web Storage support..
      loginUserStore = this.cryptoService.getCookie("loginUserStore");
    }
    return JSON.parse(JSON.stringify(loginUserStore));
  }

  getPlatformSettings(): Observable<any> {
    return this.ajaxService.get2("admin/platform_settings");
  }

  getCommonConfigurationDetails(): Observable<any> {
    var data = {}
    return this.ajaxService.post2(data, "user/global_settings");
  }

  getCountryList(): Observable<any> {
    return this.ajaxService.get("user/countries_list");
  }

  getStateList(data: {}): Observable<any> {
    return this.ajaxService.get("user/states_list?" + data);
  }

  getCityList(data: {}): Observable<any> {
    return this.ajaxService.get("user/cities_list?" + data);
  }

  getAreaList(data: {}): Observable<any> {
    return this.ajaxService.get("user/areas_list?" + data);
  }

  getCuisinesList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/cuisines_list");
  }

  getViewManageList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "admin/view_listing");
  }

  getTimeZone(): Observable<any> {
    return this.ajaxService.get2("admin/time_zone_list");
  }

  getMasterCategoryList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/store_types");
  }

  getOrderDetails(data: {}): Observable<any> {
    var userData = JSON.parse(localStorage.getItem("loginUser"));
    var role = userData.role_id == 1 ? "admin" : userData.role_id == 6 ? "admin" : "store";
    return this.ajaxService.post(data, role + '/order_details')
  }

  getStoreSetting(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'store/store_settings');
  }

  addViewManagement(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'admin/manage_master_view');
  }

  getUserList(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'store/get_store_roles');
  }

  checkValidation(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'admin/validate_query');
  }

  checkSuperAdmin(data: {}): Observable<any> {
    return this.ajaxService.get("admin/super_admin_data?" + data);
  }

  DeleteViewList(data: {}): Observable<any> {
    return this.ajaxService.post(data, 'admin/delete_master_view');
  }

  getCkImageList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/ckeditor_listing");
  }

  viewListing(data: {}): Observable<any> {
    return this.ajaxService.post(data, "user-views");
  }

  viewDetails(data: {}): Observable<any> {
    return this.ajaxService.post(data, "view-visualisation");
  }

  viewVisualization(data: {}): Observable<any> {
    return this.ajaxService.post(data, "search-view-cards");
  }

  allviewList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "all-views");
  }

  searchViewCard(data: {}): Observable<any> {
    return this.ajaxService.post(data, "filter-view-cards");
  }

  duplicateViewData(data: {}): Observable<any> {
    return this.ajaxService.post(data, "duplicate-view");
  }

  itemPrice(itemPrice: any) {
    let price: any;
    if (itemPrice != undefined && itemPrice != 0) {
      price = itemPrice?itemPrice.split("."):itemPrice;
      return price;
    } else if (Number(itemPrice) == 0) {
      price = ["0", "00"];
      return price;
    }
  }

  validateDecimal(event: any) {
    var charCode = event.keyCode;
    if ((charCode < 48 || charCode > 57) && charCode != 46) {
      event.preventDefault();
    }
  }

  validateDecimalNumber(event) {
    var charCode = event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  disbaledKeyBoard(event) {
    event.preventDefault();
  }

  valideOnlyTwoDigitAfterDecimal(amount) {
    if (amount?.split(".").length > 1 && amount?.split(".")[0] == "") {
      amount = "";
    }
    if (amount?.split(".").length > 2) {
      amount = amount?.split(".")[0] + "." + amount?.split(".")[1];
    }
    if (
      amount?.split(".").length > 1 &&
      (amount?.split(".")[1].length >= 2 || amount?.split(".")[1] > 99)
    ) {
      amount = Number(amount)?.toFixed(2);
    }
    return amount;
  }

  valideOnlyOneDigitAfterDecimal(amount) {
    if (amount?.split(".").length > 1 && amount?.split(".")[0] == "") {
      amount = "";
    }
    if (amount?.split(".").length > 2) {
      amount = amount?.split(".")[0] + "." + amount?.split(".")[1];
    }
    if (
      amount?.split(".").length > 1 &&
      (amount?.split(".")[1].length >= 2 || amount?.split(".")[1] > 9)
    ) {
      amount = Number(amount)?.toFixed(1);
    }
    return amount;
  }

  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "18px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);

    return data;
  }

   //show history
  //  GetHistoryList(data: {} , id: any): Observable<any> {
  //   return this.ajaxService.formData3(data, "api/ask/questions/" + id );
  // }

  GetHistoryList(data: {} , id: any): Observable<any> {
    return this.ajaxService.formData(data, "python/api/ask/questions/" + id );
  }

  //ask lokaly list
  askLokalyList(data: any): Observable<any> {
    console.log("248",data)
    return this.ajaxService.getwithdata(data ,"python/api/master/list");
  }

  addAskLokaly(data: {}): Observable<any> {
    return this.ajaxService.formData(data, 'python/api/master/add/questions');
  }

  editAskLokaly(data: {},id:any): Observable<any> {
    return this.ajaxService.putFomdata(data, 'python/api/master/update/questions/'+ id);
  }

  editListAskLokaly(id:any): Observable<any> {
    return this.ajaxService.get('python/api/master/get/question/' + id);
  }

  DeleteAskLokalyList(data: {} ,id:any): Observable<any> {
    return this.ajaxService.post(data, 'python/api/master/delete/questions/'+ id);
  }


  queryValidate(data: {}): Observable<any> {
    return this.ajaxService.formData2(data, 'python/api/master/validate/queries');
  }

  searchHistoryList(data:{}): Observable<any> {
    console.log("data",data)
    return this.ajaxService.getwithdata3(data, 'python/api/search/history')

  }

  commonAskedQuestion(id : any): Observable<any> {
    return this.ajaxService.get('python/api/master/random/list/' + id);
  }


}