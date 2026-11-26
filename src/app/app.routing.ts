import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>
      import("src/app/modules/auth-module/auth.module").then(
        (m) => m.AuthLayoutModule
      ),
  },
  {
    path: "error",
    loadChildren: () =>
      import("src/app/modules/errors/errors.module").then(
        (m) => m.ErrorsModule
      ),
  },
  // Public order tracking. It must stay above the "" route, whose login
  // guard would otherwise catch this URL first.
  {
    path: "ordertracking",
    loadChildren: () =>
      import(
        "src/app/modules/pages-module/order-auth-block/order-outside.module"
      ).then((m) => m.OrderOutsideModule),
  },
  {
    path: "",
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("src/app/modules/pages-module/pages.module").then(
        (m) => m.PagesModule
      ),
  },
  { path: "**", redirectTo: "/dashboard" },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: false,
    }),
  ],
  exports: [],
})
export class AppRoutingModule {}
