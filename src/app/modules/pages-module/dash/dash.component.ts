import { Component, OnInit } from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { Router } from "@angular/router";
import { UserRoles } from "src/app/enums/user-roles";
@Component({
  selector: "app-dash",
  templateUrl: "./dash.component.html",
  styleUrls: ["./dash.component.scss"],
})
export class DashComponent implements OnInit {
  main: any;
  login_store = JSON.parse(localStorage.getItem("loginUserStore"));
  is_superAdmin: boolean;
  view_validate: any;
  userRoleEnum = UserRoles;

  constructor(
    private appComponent: AppComponent, 
    private router: Router
  ) {
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.is_superAdmin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;

    if (this.is_superAdmin == true) {
      this.view_validate = this.main.LoggedUserInfo;
    } else {
      this.view_validate = this.login_store;
    }
    if (this.view_validate.role_id == this.main.UserRole.Seller || this.view_validate.role_id == this.main.UserRole.StoreManager) {
      if (this.login_store.user_role_confirm == '0') {
        this.router.navigate(['/store-details']);
      }
    }

    if (this.login_store.role_id == this.main.UserRole.PICKER) {
      this.router.navigate(["/pickerorder"]);
    }
  }
}
