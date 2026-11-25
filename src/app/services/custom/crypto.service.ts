import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

@Injectable({
  providedIn: "root",
})
export class CryptoService {
  constructor() {}

  encryptIdValue = function (val, cookiename, key) {
    var encryption = CryptoJS.AES.encrypt(val, key).toString();
    this.setCookie(cookiename, encryption, 365);
  };

  decryptIdValue = function (cookiename, key) {
    var val = this.getCookie(cookiename);
    if (val != "") {
      var decryption = CryptoJS.AES.decrypt(val, key).toString(
        CryptoJS.enc.Utf8
      );
      return decryption;
    }
    return undefined;
  };

  getCookie(cname) {
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cname) == 0) {
        return c.split("=")[1];
      }
    }
    return "";
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  clearCookie(name) {
    this.setCookie(name, {}, 0);
  }
}