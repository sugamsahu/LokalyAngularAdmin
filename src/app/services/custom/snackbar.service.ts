import { Directive, HostListener, Injectable, NgZone } from "@angular/core";
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarConfig as MatSnackBarConfig } from "@angular/material/legacy-snack-bar";

// type NewType = HTMLElement;
@Directive({
  selector: '[stopAndRemoveToastButton]',
})

@Injectable({
  providedIn: "root",
})
export class SnackbarService {
  private config: MatSnackBarConfig;
  cancelHiding = false;

  constructor(
    private snackbar: MatSnackBar,
    private zone: NgZone,
    // private e:NewType
  ) {
    this.config = new MatSnackBarConfig();
    this.config.panelClass = ["mat-snack-bar-container"];
    this.config.verticalPosition = "top";
    this.config.horizontalPosition = "right";
    this.config.duration = 5000;
  }

  @HostListener('mouseenter') onEnter() {
    this.config = new MatSnackBarConfig();
    this.config.panelClass = ["mat-snack-bar-container"];
    console.log("mouse Enter");
    
    this.config.duration=11111111111;
  }

  @HostListener('mouseleave') onLeave() {
    console.log("mouse leave");

    this.config.duration=2000
  }

  @HostListener('mouseover') onHover() {
    console.log("mouse leave");

    // this.config.duration=2000
  }

  @HostListener('mouseenter') onMouseEnter() {
    // this.hover = true;
    // this.elementRef.nativeElement.addClass = 'edit';
    console.log("mouse leave");
  }

  @HostListener('mouseleave') onMouseLeave() {
    // this.hover = false;
    // this.elementRef.nativeElement.addClass = 'un-edit';
    console.log("mouse leave");
  }

  error(message: string) {
    this.config.panelClass = ["mat-snack-bar-container", "error"];
    this.show(message);
  }

  success(message: string) {
    this.config.panelClass = ["mat-snack-bar-container", "success"];
    this.show(message);
  }

  warning(message: string) {
    this.config.panelClass = ["mat-snack-bar-container", "warning"];
    this.show(message);
  }

  private show(message: string, config?: MatSnackBarConfig) {
    
    config = config || this.config;
    this.zone.run(() => {
      this.snackbar.open(message, "Close", config);
    });
  }

  dismiss() {
    this.snackbar.dismiss();
  }
}