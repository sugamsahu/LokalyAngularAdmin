import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class PriceService {
  constructor() {}

  discountPriceCondition(discountPrice, price) {
    if (Number(discountPrice) < Number(price)) {
        return true;
    }
    else {
        return false;
    }
  }
}