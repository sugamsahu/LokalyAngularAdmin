import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-auth-layout",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  test: Date = new Date();
  public isCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit() {
    var html = document.getElementsByTagName("html")[0];
    html.classList.add("auth-layout");
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("bg-default");
    this.routerSubscription = this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }
  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    var html = document.getElementsByTagName("html")[0];
    html.classList.remove("auth-layout");
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("bg-default");
  }
}
