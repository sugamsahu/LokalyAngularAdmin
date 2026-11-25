import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AngularFireMessaging } from "@angular/fire/compat/messaging"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NotificationBellComponent } from "../modules/pages-module/model/notification-bell/notification-bell.component";
import { DomSanitizer } from "@angular/platform-browser";
@Injectable()
export class MessagingService {

    currentMessage = new BehaviorSubject<any>(null);
    displayOnlyOnceIfOpened: number = 0;

    constructor(private angularFireMessaging: AngularFireMessaging, private modalService: NgbModal, private sanitizer: DomSanitizer) {
        this.angularFireMessaging.messages.subscribe(
            (_messaging: any) => {
                _messaging.onMessage = _messaging.onMessage.bind(_messaging);
                _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
            }
        )
    }

    requestPermission() {
        this.angularFireMessaging.requestToken.subscribe(
            (token) => {
                localStorage.setItem('fcmToken', token);
                var res = token?.split(":");
                localStorage?.setItem('fcmToken', token);
                if (res)
                    localStorage?.setItem('deviceId', res[0]);
            },
            (err) => {
            }
        );
    }

    receiveMessaging() {
        var PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
        var delivery_model = PlatformSetting?.delivery_model;
        this.angularFireMessaging.messages.subscribe(
            (payload) => {
                var userData = JSON.parse(localStorage.getItem("loginUser"));
                var role = userData?.role_id == 1 || userData?.role_id == 6 ? "admin" : "store";
                if (role != 'admin') {
                    this.currentMessage.next(payload);
                    this.showCustomNotification(payload);
                    if (payload.notification?.title == 'Order Received') {
                        this.displayOnlyOnceIfOpened += 1;
                        if (this.displayOnlyOnceIfOpened == 1) {
                            const modalRef = this.modalService.open(NotificationBellComponent, {
                                size: "w-1300",
                                centered: true,
                            });
                            modalRef.componentInstance.payload = payload;
                            modalRef.componentInstance.displayOnlyOnceIfOpened.subscribe((value) => {
                                this.displayOnlyOnceIfOpened = value;
                            })
                        }
                    }
                } else if (role == 'admin' && (delivery_model == 2 || delivery_model == 4)) {
                    this.currentMessage.next(payload);
                    this.showCustomNotification(payload);
                    if (payload.notification?.title == 'Order Received') {
                        this.displayOnlyOnceIfOpened += 1;
                        if (this.displayOnlyOnceIfOpened == 1) {
                            const modalRef = this.modalService.open(NotificationBellComponent, {
                                size: "w-1300",
                                centered: true,
                            });
                            modalRef.componentInstance.payload = payload;
                            modalRef.componentInstance.displayOnlyOnceIfOpened.subscribe((value) => {
                                this.displayOnlyOnceIfOpened = value;
                            })
                        }
                    }
                }
            })
    }
    showCustomNotification(payload) {
        let notify_data = payload['notification'];
        let title = notify_data['title'];
        let body = notify_data['body'];
        let options = {
            icon: payload.data['gcm.notification.notification_thumb'],
            badge: payload.data['gcm.notification.notification_thumb'],
            image: payload.data['gcm.notification.notification_image'],
            body: body,
        }
        // (title, options) // options can also be added in the parameter
        let notify: Notification = new Notification(title,options)
        //for redirection when click on notification
        notify.onclick = event => {
            event.preventDefault();
        }
    }
}
