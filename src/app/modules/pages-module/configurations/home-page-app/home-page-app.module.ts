import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { HomePageAppComponent } from "./home-page-app.component";

@NgModule({
  declarations: [HomePageAppComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: HomePageAppComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class HomePageAppModule { }
