import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: "app-logged-user",
  templateUrl: "./logged-user.component.html",
  styleUrls: ["./logged-user.component.scss"],
})
export class LoggeduserComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  public users: any;
  storeUserRoles: any[] = [];
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    // $(
    //   "<style>.modal-dialog { max-width: 500px ;}</style>"
    // ).appendTo("body");
    // this.cdr.detectChanges();
  }

  NotificationCountReturn(count) {
    var notification = "";
    if (Number(count) > 99) {
      notification = "99+";
    } else {
      notification = count;
    }
    return notification;
  }

  submitChangeUser(user) {
    this.passEntry.emit(user);
    this.activeModal.dismiss("Cross click");
  }

  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "16px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }
}
