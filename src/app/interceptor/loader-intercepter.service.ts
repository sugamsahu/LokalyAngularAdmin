import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { SpinnerService } from "../services/custom/spinner.service";
import { catchError, tap ,finalize } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class LoaderIntercepterService implements HttpInterceptor {
  constructor(private spinner: SpinnerService, private router: Router,) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.spinner.show();
    return next.handle(request).pipe(
      finalize(() => {
        this.spinner.hide();
      }),
      catchError((error) => {
        if(error.status == 401){
          localStorage.clear()
          this.router.navigate([`/auth/login`]);
          $("body").removeClass("menu-open");
          $("footer").hide();
          $(".main-content").css("padding-bottom", "0");
          return throwError('Unauthorized')
        }
        // Pass every other error on to the screen that made the request.
        return throwError(() => error);
      })
    );
    
  }
}
