import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { HomePagePortalComponent } from "./home-page-portal.component";

@NgModule({
  declarations: [HomePagePortalComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: HomePagePortalComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class HomePagePortalModule { }
