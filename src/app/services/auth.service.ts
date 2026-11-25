import { Injectable, OnDestroy } from "@angular/core";
import { Observable, BehaviorSubject, of, Subscription } from "rxjs";
import { map, finalize } from "rxjs/operators";
import { LoginModel } from "src/app/models/login.model";
import { AjaxService } from "./ajax.service";
export type UserType = LoginModel | undefined;

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(private ajaxService: AjaxService) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // public methods
  login(data): Observable<UserType> {
    this.isLoadingSubject.next(true);
    var objData = {
      phone: data.phone,
      password: data.password,
      fcm_token: data.fcm_token,
      device_os: data.device_os,
    };
    return this.ajaxService.post(objData, "user/login").pipe(
      map((result) => {
        if (result.data == undefined) {
          return result;
        }
        localStorage.setItem(
          "LoginUserDetails",
          JSON.stringify(result.data.profile)
        );
        return result;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}