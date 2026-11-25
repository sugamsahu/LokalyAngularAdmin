import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthModuleRoutes } from "./auth-module.routing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoginComponent } from "./login/login.component";
import { ToastrModule } from "ngx-toastr";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { MaterialModule } from "src/app/material/material/material.module";
import { AuthComponent } from "./auth.component";
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';

@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule.forChild(AuthModuleRoutes),
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [AuthComponent, LoginComponent, ResetPasswordComponent],
})
export class AuthLayoutModule {}
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
