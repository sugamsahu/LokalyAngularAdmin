import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class ErrorInterceptorService implements HttpInterceptor {
  constructor(private _snackbarService: ToastrService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this._snackbarService.error("request authentication error");
        } else if (err.status === 400) {
          const message: string = "something is wrong try again later.";
          this._snackbarService.error(message);
        }
        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }
}
