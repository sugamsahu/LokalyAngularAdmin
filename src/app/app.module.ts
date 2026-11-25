import { LoaderIntercepterService } from "./interceptor/loader-intercepter.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { AppComponent } from "./app.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { AppRoutingModule } from "./app.routing";
import { NgxSpinnerModule } from "ngx-spinner";
import { ToastrModule } from "ngx-toastr";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgxPaginationModule } from "ngx-pagination";
import { AgmCoreModule } from "@agm/core";
import { ImageCropperModule } from "ngx-image-cropper";
import { MaterialModule } from "./material/material/material.module";
import { AngularFireModule } from "@angular/fire/compat";
import { environment } from "src/environments/environment";
import { AngularFireMessagingModule } from "@angular/fire/compat/messaging";
import { MessagingService } from "./push-notification-service/messaging-service";
import { AsyncPipe } from "@angular/common";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgImageSliderModule } from "ng-image-slider";

@NgModule({
  imports: [
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule,
    AppRoutingModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      enableHtml:true
    }),
    NgxPaginationModule,
    ImageCropperModule,
    AgmCoreModule.forRoot({
      // please get your own API key here:
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
    AngularFireModule.initializeApp(environment.firebase),
    // Firestore, Auth, Storage and Highcharts are imported only in the lazy modules that use them,
    // so they stay out of main.js.
    AngularFireMessagingModule,
    FontAwesomeModule,
    NgImageSliderModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderIntercepterService,
      multi: true,
    },
    MessagingService,
    AsyncPipe
  ],
})
export class AppModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
