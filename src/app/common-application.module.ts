import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgxPaginationModule } from "ngx-pagination";
import { HttpClient } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { MaterialModule } from "./material/material/material.module";
import { SortDirective } from "./modules/pages-module/directives/sort-directive";
import { SortPipe } from "./modules/pages-module/util/sort.pipe";
import { ClickOutsideDirective } from "./modules/pages-module/directives/click-outside";
import { TwoDigitDecimaNumberDirective } from "./modules/pages-module/directives/two-digit-decimal-number";
import { NgImageSliderModule } from "ng-image-slider";

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    NgSelectModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [SortDirective, SortPipe, ClickOutsideDirective, TwoDigitDecimaNumberDirective],
  exports: [
    CommonModule,
    MaterialModule,
    NgSelectModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    TranslateModule,
    SortDirective,
    SortPipe,
    ClickOutsideDirective,
    TwoDigitDecimaNumberDirective,
    NgImageSliderModule
  ],
})
export class CommonApplicationModule {}
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
