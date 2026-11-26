import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { SortPipe } from "../util/sort.pipe";
import * as moment from "moment";
import { serverTimestamp } from "@firebase/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { CommonService } from "src/app/services/common.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderItemDetailsComponent } from "../model/order-item-details/order-item-details.component";
import { AddSelectItemComponent } from "../model/add-select-item/add-select-item.component";
import { OrderService } from "src/app/services/order.service";
import { OrderDetailsModalComponent } from "../model/order-details/order-details.component";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ViewChatSupportImageComponent } from "../model/view-chat-support-image/view-chat-support-image.component";
import { ShareLocationModelComponent } from "../model/share-location/share-location.component";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-chat-support",
  templateUrl: "./chat-support.component.html",
  styleUrls: ["./chat-support.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ChatSupportComponent implements OnInit {
  helpDetails: any;
  @ViewChild("scrollToGroup") private myScrollGroup: ElementRef;
  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (
      event.key == "Enter" &&
      this.myMessage !== undefined &&
      this.myMessage !== ""
    ) {
      this.sendMyMessage();
    }
  }
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  loginUser = JSON.parse(localStorage.getItem("loginUser"));
  store_email = this.sellerDetails.store_id + "@lokaly.in";
  store_pswd = "login12*";
  activechatflag: boolean = false;
  uid: any = localStorage.getItem("UID");
  group_data: any;
  groupArray: any = [];
  mainGroupArray: any = [];
  order_Data: any = [];
  orderDetails: any = [];
  display: number = 0;
  messageflag: boolean = false;
  search: string = "";
  clickOrderDetail: any;
  messages: any = [];
  usersCollection: any;
  groupsCollection: any;
  previousIndex: number;
  ProcessOrderOrderId: any;
  data: any;
  generalSetting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency: any = this.generalSetting.currency_symbol;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  myMessage: string;
  chatImage: string;
  chatDoc: string;
  chatorderItem: any = [];
  orderItem: any = [];
  file: any;
  orderdetaill: any = [];
  isAllowAddItemOrder: boolean = false;
  screen_width: any;
  showEmojiPicker: boolean = false;
  @ViewChild("scrollToBottm") private myScrollContainer: ElementRef;
  iseatery: number;
  language_id = localStorage.getItem("select_lan_id") || "1";
  mainGroupCount: number = 0;

  constructor(
    private fireAuth: AngularFireAuth,
    private translate: TranslateService,
    private appComponent: AppComponent,
    private afs: AngularFirestore,
    private sortPipe: SortPipe,
    private toastr: ToastrService,
    private storage: AngularFireStorage,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService,
    private modalService: NgbModal,
    private orderService: OrderService,
    private _helpService: BannerService,
    public sanitizer: DomSanitizer,
    public spinner: NgxSpinnerService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    this.screen_width = window.innerWidth;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    var sessionConfig = this.appComponent.sessionConfig();
    this.ProcessOrderOrderId = sessionConfig.decryptIdValue(
      "ProcessOrderOrderId" + this.sellerDetails.store_id.toString(),
      this.main.CryptoKey
    );
    this.session.clearCookie(
      "ProcessOrderOrderId" + this.sellerDetails.store_id.toString()
    );
    this.generalSetting =
      this.generalSetting == null ? this.main : this.generalSetting;
    if (!this.global_currency) {
      this.global_currency = this.generalSetting.currency_symbol;
    }
    this.spinner.show()
    this.fireAuthentication();
    this.getHelpDetails();
  }

  async fireAuthentication() {
    await this.fireAuth
      .signInWithEmailAndPassword(this.store_email, this.store_pswd)
      .then((userCred) => {
        this.uid = userCred.user.uid;
        localStorage.setItem("UID", this.uid);
        this.usersCollection = this.afs.collection("users");
        this.groupsCollection = this.afs.collection("groups");
        this.groupDetails();
      })
      .catch((error) => {
        this.activechatflag = true;
        this.spinner.hide()
      });
  }

  //View multiple img
  open_img_view(image: any) {
    const modalRef = this.modalService.open(ViewChatSupportImageComponent, {
      size: "lg",
    });
    modalRef.componentInstance.images = image;
  }

  async groupDetails() {
    await this.usersCollection
      .doc(this.uid.toString())
      .valueChanges()
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.groupArray = []
            this.mainGroupArray = []
            this.group_data = res;
            if (this.group_data.groups.length == 0) {
              this.activechatflag = true
            }
            this.group_data.groups.forEach((el) => {
              this.groupArray.push(el);
            });
            this.groupArray.forEach((item) => {
              if (item != null) {
                var test = item.substr(0, item.indexOf("_"));
                if (test != undefined) {
                  this.mainGroupArray.push(test);
                }
              }
            });
            if (this.mainGroupArray.length > 0) {
              if (this.mainGroupCount < 1) {
                this.getgrouporderdetails();
              }
              this.mainGroupCount++
            }
          } else {
            this.activechatflag = true;
          }
        },
        error: (err) => { this.activechatflag = true, this.spinner.hide() },
      });
  }

  async getgrouporderdetails() {
    this.mainGroupArray.forEach(async (element) => {
      if (element != undefined) {
        await this.groupsCollection
          .doc(element)
          .valueChanges()
          .subscribe({
            next: (res: any) => {
              this.display++;
              if (res != undefined) {
                this.order_Data = res;
                this.orderDetails.forEach((el) => {
                  if (!el.groupOrderDetails.customer?.user_picture || el?.groupOrderDetails?.customer?.user_picture?.includes('data:image/png;base64')) {
                    el.groupOrderDetails.customer.user_picture = this.handleImageError(el.groupOrderDetails.customer?.name)
                  }
                  if (el.groupId == this.order_Data.groupId) {
                    el.unread = this.order_Data.unreadStoreMessages;
                    el.unreadcus = this.order_Data.unreadCustomerMessages;
                  }
                });
                if (
                  this.order_Data.groupIcon ||
                  this.order_Data.groupId ||
                  this.order_Data.groupOrderDetails
                ) {
                  if (typeof this.order_Data.groupOrderDetails == 'string') {
                    var orderDetails = JSON.parse(this.order_Data?.groupOrderDetails)
                  } else {
                    var orderDetails = this.order_Data?.groupOrderDetails
                  }
                  this.activechatflag = false
                  this.orderDetails.forEach((item: any, index: any) => {
                    if (item.groupId == this.order_Data.groupId) {
                      this.orderDetails.splice(index, 1);
                    }
                  });
                  this.orderDetails.push(
                    (element = {
                      group_Icon: this.order_Data.groupIcon,
                      groupId: this.order_Data.groupId,
                      groupOrderDetails: orderDetails,
                      orderId: orderDetails.order_id,
                      unread: this.order_Data.unreadStoreMessages,
                      unreadcus: this.order_Data.unreadCustomerMessages,
                      recentMessageTime: this.order_Data.recentMessageTime,
                    })
                  );
                  this.orderDetails = this.orderDetails.filter(
                    (value, index, self) =>
                      index ===
                      self.findIndex((t: any) => t.orderId === value.orderId)
                  ); // logic for removing dupliacte
                  this.orderDetails = this.sortPipe.transform(
                    this.orderDetails,
                    "desc",
                    "recentMessageTime"
                  ); //sort by orderId
                  this.cdr.detectChanges()
                  if (this.mainGroupArray.length == this.display) {
                    this.messageflag = true;
                    var selectedOrder = undefined;
                    if (this.ProcessOrderOrderId != undefined) {
                      // Done just use it
                      for (var i = 0; i <= this.orderDetails.length; i++) {
                        if (
                          this.orderDetails[i]?.orderId ==
                          this.ProcessOrderOrderId
                        ) {
                          selectedOrder = this.orderDetails[i];
                          this.setCurrentActive(i);
                          setTimeout(() => this.scrollToElement(), 1000);
                        }
                      }
                    } else {
                      selectedOrder = this.orderDetails[0];
                    }
                    if (document.getElementsByClassName('activeChat').length == 0) {
                      this.previousIndex = 0
                    } else {
                      this.previousIndex = this.previousIndex + 1
                    }
                    this.showmessage(selectedOrder);
                    return;
                  }
                  else {
                    if (this.orderDetails && this.orderDetails.length > 0) {
                      this.orderDetails.forEach((item: any, index: any) => {
                        if (item.groupId == this.clickOrderDetail?.groupId) {
                          this.previousIndex = index
                        }
                      });
                    }
                  }
                }
              } else {
                this.orderDetails.forEach((item, index) => {
                  if (item.groupId == element.groupId) {
                    this.orderDetails.splice(index, 1);
                    this.previousIndex = 0
                    if (this.orderDetails[0]) {
                      this.showmessage(this.orderDetails[0]);
                    }
                  }
                });
                if (this.orderDetails.length == 0) {
                  this.activechatflag = true
                }
              }
            },
            error: (err) => { this.spinner.hide() },
            complete: () => {
            }
          });
      }
    });
  }
  /** Set current active user */
  setCurrentActive(id) {
    this.previousIndex = id;
    $('.chat-col').css({ 'display': 'block' })
  }

  goToChatList() {
    $('.chat-col').css({ 'display': 'none' })
  }

  isJSON(data) {
    var ret = true;
    try {
      JSON.parse(data);
    } catch (e) {
      ret = false;
    }
    return ret;
  }

  filterResult() {
    var searchFilter = null;
    if (this.search != "") {
      searchFilter = this.orderDetails.filter((item) => {
        return (
          item.groupOrderDetails.order_no.indexOf(this.search) != -1 ||
          item.groupOrderDetails.customer.name
            .toLowerCase()
            .indexOf(this.search.toLowerCase()) != -1
        );
      });
    } else {
      searchFilter = this.orderDetails;
    }
    return searchFilter;
  }

  /** Show chat message */
  showmessage(item: any) {
    this.clickOrderDetail = item;
    this.afs
      .collection("groups")
      .doc(this.clickOrderDetail.groupId)
      .collection("messages")
      .ref.orderBy("time")
      .onSnapshot((snapshot) => {
        if (this.clickOrderDetail.groupId == item.groupId) {
          this.messages = [];
          if (this.clickOrderDetail.unread != 0) {
            this.clickOrderDetail.unread = 0;
            this.groupsCollection
              .doc(this.clickOrderDetail.groupId)
              .update({ unreadStoreMessages: 0 });
          }
          snapshot.forEach((doc) => {
            this.data = doc.data();
            this.data.messageTime = this.toDateTime(this.data.showtime);
            this.data.isVisible = false;
            if (this.data.type == 4) {
              // Shown in an iframe. Chat messages come from customers, so only
              // https links are trusted (a javascript: URL would run in the panel).
              this.data.message = /^https:\/\//i.test(String(this.data.message || "").trim())
                ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data.message)
                : "";
            }
            if (this.data.type == 5) {
              let paramString = this.data.message.split('/messages%2F')[1];
              let params_arr = paramString.split('?')[0];
              this.data.message_name = decodeURIComponent(params_arr)
            }
            if (this.data.type == 3 || this.data.type == 2) {
              this.data.message = JSON.parse(this.data.message);
              this.messages.push(this.data);
              this.messages.forEach((event) => {
                if (event.type == 2 || event.type == 3) {
                  event.message.forEach((Item) => {
                    if (Item.item_variants != undefined) {
                      Item.item_variants.forEach((variant) => {
                        if (variant.is_added == 1) {
                          Item.quantity = variant.quantity;
                          if (variant.discounted_price) {
                            Item.discounted_price = variant.discounted_price;
                          } else {
                            Item.discounted_price = variant.item_price;
                          }
                          Item.unit_quantity = variant.unit_quantity;
                          Item.unit_name = variant.unit_name;
                        }
                      });
                    }
                  });
                }
              });
            } else {
              if (this.data.type != 2 && this.data.type != 3) {
                this.messages.push(this.data);
              }
            }
            if (this.data.user_id != this.sellerDetails.user_id) {
              if (
                this.data.readstatus == "no" ||
                this.data.readstatus == "No"
              ) {
                this.groupsCollection
                  .doc(this.clickOrderDetail.groupId)
                  .collection("messages")
                  .doc(doc.id)
                  .update({ readstatus: "yes" });
              }
            }
          });

          this.messages.forEach((item) => {
            item.messageTime = moment(item.messageTime).format(
              this.main.DateFormate
            );
          });
          this.scrollToBottom();
        }
      });
  }

  toDateTime(dt) {
    return moment(parseInt(dt)).format("DD-MMM-YY H:mm:ss");
  }

  activateReadMore(i) {
    if (this.messages[i].isVisible == false) {
      this.messages[i].isVisible = true;
      return;
    } else {
      this.messages[i].isVisible = false;
      return;
    }
  }

  scrollToElement() {
    const element = this.myScrollGroup.nativeElement.querySelector('.activeChat');
    if (element) {
      var headerOffset = 220;
      var elementPosition = element.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      try {
        this.myScrollGroup.nativeElement.scrollTop = offsetPosition;
        this.cdr.detectChanges();
      } catch (err) { }
    }
  }

  //type 0 text message send
  sendMyMessage() {
    const inputText = {
      message: this.myMessage,
      title: null,
      fileName: "",
      itemfrom: "",
      readstatus: "no",
      type: 0,
      sender: this.sellerDetails.name,
      user_id: this.sellerDetails.user_id,
      time: serverTimestamp(),
      logo: this.sellerDetails.store_logo,
      showtime: Date.parse(new Date().toString()).toString(),
    };
    setTimeout(() => this.scrollToElement(), 1000);
    if (
      inputText.message !== undefined &&
      inputText.message !== "" &&
      inputText.message !== "\n"
    ) {
      this.groupsCollection
        .doc(this.clickOrderDetail.groupId)
        .collection("messages")
        .add(inputText);
      this.groupsCollection.doc(this.clickOrderDetail.groupId).update({
        unreadCustomerMessages: Number(this.clickOrderDetail.unreadcus) + 1,
        recentMessageTime: Date.parse(new Date().toString()).toString()
      });
      this.showEmojiPicker = false;
      this.updateChatCount()
      this.sendChatNotification(0, inputText.message)
    } else {
      this.myMessage = null;
    }
    this.myMessage = "";
  }

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  getFile(event) {
    this.file = null;
    this.file = event.target.files[0];
    if (this.file.name.indexOf(".") > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split("/").pop().toLowerCase();
    }
    if (
      $.inArray(extension, ["png", "PNG", "jpg", "jpeg", "pdf", "doc"]) == -1
    ) {
      this.toastr.error(this.translate.instant("Only pdf & image format are allowed to share. Please upload a valid file."));
      return;
    }
    if ($.inArray(extension, ["png", "PNG", "jpg", "jpeg"]) > -1) {
      this.storage
        .ref("/messages")
        .child(this.file.name)
        .put(this.file)
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            this.chatImage = url;
            this.sendImage();
          });
        });
    }
    if ($.inArray(extension, ["pdf", "doc"]) > -1) {
      this.storage
        .ref("/messages")
        .child(this.file.name)
        .put(this.file)
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            this.chatDoc = url;
            this.sendDoc();
          });
        });
    }
  }

  //type 1 image send
  sendImage() {
    const inputImage = {
      message: this.chatImage,
      title: null,
      fileName: "",
      itemfrom: "",
      readstatus: "no",
      type: 1,
      sender: this.sellerDetails.name,
      user_id: this.sellerDetails.user_id,
      time: serverTimestamp(),
      logo: this.sellerDetails.store_logo,
      showtime: Date.parse(new Date().toString()).toString(),
    };
    setTimeout(() => this.scrollToElement(), 1000);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .collection("messages")
      .add(inputImage);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .update({
        unreadCustomerMessages: this.clickOrderDetail.unreadcus + 1,
        recentMessageTime: Date.parse(new Date().toString()).toString()
      });
    this.updateChatCount()
    this.sendChatNotification(1, inputImage.message)
    this.chatImage = "";
  }

  //type 5 send document
  sendDoc() {
    const inputDoc = {
      message: this.chatDoc,
      title: null,
      fileName: "",
      itemfrom: "",
      readstatus: "no",
      type: 5,
      sender: this.sellerDetails.name,
      user_id: this.sellerDetails.user_id,
      time: serverTimestamp(),
      logo: this.sellerDetails.store_logo,
      showtime: Date.parse(new Date().toString()).toString(),
    };
    setTimeout(() => this.scrollToElement(), 1000);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .collection("messages")
      .add(inputDoc);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .update({
        unreadCustomerMessages: this.clickOrderDetail.unreadcus + 1,
        recentMessageTime: Date.parse(new Date().toString()).toString()
      });
    this.updateChatCount()
    this.sendChatNotification(5, inputDoc.message)
    this.chatDoc = "";
  }
  /** Open AddOrderAddItemComponent modal */
  openSelectItemFromStore() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.chatSupport = 'true';
    modalRef.componentInstance.orderItemDetails = this.orderdetaill;
    modalRef.componentInstance.SelectedItemFromStore.subscribe((items) => {
      if (items.length > 0) {
        this.addStoreItemsInChat(items);
      }
    });
  }

  addStoreItemsInChat(items) {
    var objSelectedItems = [];
    items.forEach((Item) => {
      var objcategoryItemdetail: any = {
        category_id: Item.category_id,
        category_name: Item.category_name,
        sub_category_id: Item.sub_category_id,
        sub_category_name: Item.sub_category_name,
        item_id: Item.item_id,
        order_item_id: Item.order_item_id,
        item_name: Item.item_name,
        brand_name: Item.brand_name,
        item_description: Item.item_description,
        item_image: Item.item_image,
        item_image_thumb: "",
        item_type: Item.item_type,
      };
      Item.item_price = Item.price;
      Item.is_added = 1;
      Item.item_image = Item.ImageObject[0].image;
      objcategoryItemdetail.item_variants = [];
      var isAddedVarient = false;

      if (objSelectedItems.length > 0) {
        objSelectedItems.forEach((objItem) => {
          if (objItem.item_id == Item.item_id) {
            isAddedVarient = true;
            objItem.item_variants.push(Item);
          }
        });
      }

      if (isAddedVarient == false) {
        objcategoryItemdetail.item_variants.push(Item);
        objSelectedItems.push(objcategoryItemdetail);
      }
    });
    const inputStoreItem: any = {
      message: JSON.stringify(objSelectedItems),
      title: null,
      fileName: "",
      itemfrom: "Items from Store",
      readstatus: "no",
      type: 2,
      sender: this.sellerDetails.name,
      user_id: this.sellerDetails.user_id,
      time: serverTimestamp(),
      logo: this.sellerDetails.store_logo,
      showtime: Date.parse(new Date().toString()).toString(),
    };
    setTimeout(() => this.scrollToElement(), 1000);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .collection("messages")
      .add(inputStoreItem);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .update({
        unreadCustomerMessages: this.clickOrderDetail.unreadcus + 1,
        recentMessageTime: Date.parse(new Date().toString()).toString()
      });
    this.updateChatCount()
    this.sendChatNotification(2, inputStoreItem.message)
  }

  openSelectItemFromOrder() {
    this.orderdetaill = [];
    const data = {
      order_id: this.clickOrderDetail.groupOrderDetails.order_id,
    };

    this.commonService.getOrderDetails(data).subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          res.data.items.forEach((Item) => {
            Item.item_variants.forEach((variant) => {
              if (variant.is_added == 1) {
                var item_data: any = {
                  item_image: variant.variant_image,
                  item_name: Item.item_name,
                  brand_name: Item.brand_name,
                  packaging_name: variant.packaging_name,
                  unit_name: variant.unit_name,
                  quantity: variant.quantity,
                  unit_quantity: variant.unit_quantity,
                  discounted_price: variant.discounted_price,
                  price: variant.item_price,
                  packaging: variant.packaging,
                  isAllowAddItemOrder: this.isAllowAddItemOrder,
                  item_variants_id: variant.item_variants_id,
                  item_id: Item.item_id
                };
                if (variant.choices_addons != null) {
                  item_data.choices_addons = variant.choices_addons;
                } else {
                  item_data.choices_addons = null;
                }
                if (Item.combo_variants != null) {
                  item_data.combo_variants = Item.combo_variants;
                } else {
                  item_data.combo_variants = null;
                }
                this.orderdetaill.push(item_data);
              }
            });
          });
        } else {
        }
      },
    });

    const modalRef = this.modalService.open(OrderItemDetailsComponent, {
      size: "lg",
      centered: true,
    });

    modalRef.componentInstance.orderItemDetails = this.orderdetaill;

    modalRef.componentInstance.SelectedOrder.subscribe((items) => {
      this.addOrderItemInChat(items);
    });
  }

  addOrderItemInChat(item) {
    this.chatorderItem = item;
    this.chatorderItem.forEach((el) => {
      if (el != undefined) {
        if (el.isAllowAddItemOrder == true) {
          this.orderItem.push(el);
        }
      }
    });
    if (this.orderItem.length == 0) {
      return;
    }

    const inputOrderItem = {
      message: JSON.stringify(this.orderItem),
      title: null,
      fileName: "",
      itemfrom: "Items from order",
      readstatus: "no",
      type: 3,
      sender: this.sellerDetails.name,
      user_id: this.sellerDetails.user_id,
      time: serverTimestamp(),
      logo: this.sellerDetails.store_logo,
      showtime: Date.parse(new Date().toString()).toString(),
    };
    setTimeout(() => this.scrollToElement(), 1000);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .collection("messages")
      .add(inputOrderItem);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .update({
        unreadCustomerMessages: this.clickOrderDetail.unreadcus + 1,
        recentMessageTime: Date.parse(new Date().toString()).toString()
      });
    this.updateChatCount()
    this.sendChatNotification(3, inputOrderItem.message)
    this.chatorderItem = [];
    this.orderItem = [];
  }

  scrollToBottom() {
    this.cdr.detectChanges();
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
      this.cdr.detectChanges();
    } catch (err) { }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    const { myMessage } = this;
    let text = "";
    if (!this.myMessage) {
      text = `${event.emoji.native}`;
    } else {
      text = `${myMessage}${event.emoji.native}`;
    }
    this.myMessage = text;
  }

  clickedOutside(): void {
    this.showEmojiPicker = false;
  }
  viewOrder: boolean = false;

  viewCustomerOrderDetail(details: any, flag: any) {
    this.viewOrder = flag;
    var data = {
      order_id: details.orderId,
    };

    this.orderService.getOrderDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderDetailBinding(response.data, 0);
          this.orderDetailsModal(response.data);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  orderdetail: any;
  ItemTotalPrice: any;
  date: any = {
  };
  orderitemdetail: any = [];

  orderDetailBinding(details: any, isordersummary: any) {
    this.orderdetail = details;
    this.orderdetail.order_tip = Number(
      this.orderdetail.order_tip || 0
    ).toFixed(2);
    this.orderdetail.PaymentType = this.orderdetail.payment_method_name;
    this.orderdetail.DeliveryType = this.orderdetail.delivery_type_val;
    this.orderdetail.OrderStatus = this.orderdetail.order_status_val;
    this.orderdetail.order_amount = Number(
      this.orderdetail.order_amount || 0
    ).toFixed(2);
    this.orderdetail.offer_discount = Number(
      this.orderdetail.offer_discount || 0
    ).toFixed(2);
    this.orderdetail.discount =
      this.orderdetail.order_status == 1
        ? Number(this.orderdetail.discount || 0).toFixed(2)
        : Number(this.orderdetail.discount || 0).toFixed(2);

    if (this.orderdetail.delivery_type == 2) {
      this.orderdetail.delivery_charges = "0.00";
    }

    this.orderdetail.delivery_charges = Number(
      this.orderdetail.delivery_charges || 0
    ).toFixed(2);
    this.orderdetail.otherCharges = Number(
      Number(this.orderdetail.order_tax) +
      Number(this.orderdetail.packaging_cost)
    ).toFixed(2);

    this.taxAndChargesTotalToolTip = this.taxAndChargesToolTip(this.global_currency, this.orderdetail.packaging_cost, this.orderdetail.order_tax);
    this.orderdetail.OriginalOrderAmount = Number(
      this.orderdetail.order_amount
    ).toFixed(2);
    this.orderdetail.item_total = Number(
      Number(this.orderdetail.order_amount) -
      Number(this.orderdetail.delivery_charges) -
      Number(this.orderdetail.otherCharges) +
      Number(this.orderdetail.offer_discount) +
      Number(this.orderdetail.discount) -
      Number(this.orderdetail.order_tip)
    ).toFixed(2);
    this.orderdetail.order_amount = Number(
      this.orderdetail.order_amount - Number(this.orderdetail.wallet_amount)
    ).toFixed(2);
    this.ItemTotalPrice = this.orderdetail.order_amount;

    this.orderdetail.IsScheduledOrder = false;
    if (this.orderdetail.delivery_type == 1) {
      if (this.orderdetail.delivery_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.scheduled_delivery_date;
            this.date.revisedDateTime = this.orderdetail.delivery_date;
            this.date.revisedDateTimeTemp = this.orderdetail.delivery_date;
          }
        }
      } else {
        var OrderDate = new Date(this.orderdetail.order_date);
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date =
            this.orderdetail.scheduled_delivery_date;
          this.date.revisedDateTime = this.orderdetail.delivery_date;
        }
      }
    } else {
      // Pick Time  start
      if (this.orderdetail.pickup_time_type == 1) {
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          if (this.orderdetail.order_status != 5) {
            this.orderdetail.delivery_date =
              this.orderdetail.scheduled_delivery_date;
            this.date.revisedDateTime = this.orderdetail.delivery_date;
            this.date.revisedDateTimeTemp = this.orderdetail.delivery_date;
          }
        }
      } else {
        var OrderDate = new Date(this.orderdetail.order_date);
        if (this.orderdetail.scheduled_delivery_date == "") {
        } else {
          this.orderdetail.IsScheduledOrder = true;
          this.orderdetail.delivery_date =
            this.orderdetail.scheduled_delivery_date;
        }
      }
      // Pick Time  End
    }

    var itemdetails = [];
    this.orderdetail.items.forEach((Item: any) => {
      Item.item_variants.forEach((variant: any) => {
        if (variant.is_added == 1) {
          var item_data: any = {
            item_name: Item.item_name,
            location: Item.location,
            item_remark: variant.item_remark,
            brand_name: Item.brand_name,
            packaging_name:
              variant.packaging_name == "NULL" ? "" : variant.packaging_name,
            unit_name: variant.unit_name == "NULL" ? "" : variant.unit_name,
            quantity: variant.quantity,
            picker_quantity: variant.picker_quantity,
            item_pickup_status: variant.item_pickup_status,
            is_picker_add: variant.is_picker_add,
            referance_item_id: variant.referance_item_id,
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            item_price: variant.item_price,
            packaging: variant.packaging,
            category_name: Item.category_name,
            sub_category_name: Item.sub_category_name,
            display_id: Item.display_id,
          };
          if (variant.choices_addons != null) {
            item_data.choices_addons = variant.choices_addons;
          } else {
            item_data.choices_addons = null;
          }

          var choices_addons = [];
          if (Item.combo_variants != null) {
            item_data.combo_variants = Item.combo_variants;
            if (item_data.combo_variants) {
              item_data.combo_variants.forEach((combo: any) => {
                choices_addons = [];
                if (combo.choices) {
                  combo.choices.forEach((choice: any) => {
                    choice.choice_prices.forEach((choicePrice: any) => {
                      if (
                        choicePrice.is_added == true ||
                        choicePrice.is_added == 1
                      ) {
                        choices_addons.push(
                          choice.variant_choice_name +
                          " : " +
                          choicePrice.variant_sub_choice_name
                        );
                      }
                    });
                  });
                }
                if (combo.addons) {
                  combo.addons.forEach((addon: any) => {
                    var addonName = "";
                    addon.addon_prices.forEach((addonsPrice) => {
                      if (
                        addonsPrice.is_added == true ||
                        addonsPrice.is_added == 1
                      ) {
                        addonName =
                          addonName == ""
                            ? addonsPrice.variant_sub_addon_name
                            : addonName +
                            ", " +
                            addonsPrice.variant_sub_addon_name;
                      }
                    });
                    if (addonName != "") {
                      choices_addons.push(
                        addon.variant_addon_name + " : " + addonName
                      );
                    }
                  });
                }
                combo.choices_addons = choices_addons;
              });
            }
          }

          itemdetails.push(item_data);
        }
      });
    });

    if (isordersummary == 3) {
    } else {
      this.orderitemdetail = itemdetails;
    }
    this.orderitemdetail = itemdetails;
  }

  session = this.appComponent.sessionConfig();
  taxAndChargesTotalToolTip: any;
  closeResult: any;
  okButton;
  orderDetailsModal(data: any) {
    const modalRef = this.modalService.open(OrderDetailsModalComponent, {
      size: "lg-950",
    });
    modalRef.componentInstance.orderdetail = data;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
    modalRef.componentInstance.viewOrder = this.viewOrder;
    this.okButton = 0
    modalRef.componentInstance.okButton = this.okButton;
    modalRef.componentInstance.taxAndChargesTotalToolTip = this.taxAndChargesTotalToolTip;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
      }
    );
  }

  taxAndChargesToolTip(global_currency, packaging_cost, order_tax) {
    var taxAndChargesTotalToolTip = "";
    if (Number(packaging_cost) > 0 && Number(order_tax) <= 0) {
      taxAndChargesTotalToolTip =
        "<div>Store Packaging Cost: " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        "</div>";
    } else if (Number(order_tax) > 0 && Number(packaging_cost) <= 0) {
      taxAndChargesTotalToolTip =
        "<div>" +
        this.generalSetting.store_tax_label +
        ": " +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    } else {
      taxAndChargesTotalToolTip =
        "<div style='width:100%;'><div style='float:left; text-align:left;'>" +
        this.generalSetting.store_label +
        " Packaging Cost: </div><div style='float:right;'> " +
        global_currency +
        " " +
        Number(packaging_cost).toFixed(2) +
        "</div> </div><div style='width:100%;clear:both;'><div style='width:calc(100% - 50px); float:left; text-align:left;'> " +
        this.generalSetting.store_tax_label +
        ": </div><div style='float:right;'>" +
        global_currency +
        " " +
        Number(order_tax).toFixed(2) +
        "</div>";
    }
    return taxAndChargesTotalToolTip;
  }

  handleImageError(name: any) {
    return this.generateDefaultImage(name, 65, 150);
  }

  generateDefaultImage(name: string, x: number, y: number, label?: any) {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = 220;
    canvas.height = 212;
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d')!;
    context.fillStyle = label ? this.generalSetting.css_button_customer_hover : this.generalSetting.css_button_customer_hover;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '130px Helvetica';
    context.fillStyle = label ? this.generalSetting.css_button_customer_hover_font : this.generalSetting.css_button_customer_hover_font;
    const nameArray = name?.split(' ');
    let initials = '';
    for (let i = 0; i < nameArray?.length; i++) {
      if (i <= 0) {
        initials = initials + nameArray[i][0];
      }
    }
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 20, 35);
    } else {
      context.fillText(initials.toUpperCase(), x, y);
    }
    const data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  updateChatCount() {
    var role = this.loginUser.role_id == 1 || this.loginUser.role_id == 6 ? "admin" : "store";
    var data: any = {
      user_id: this.main.LoggedUserInfo.user_id,
      order_id: this.clickOrderDetail.orderId,
      group_id: this.clickOrderDetail.groupId,
      unreadCustomerMessages: Number(this.clickOrderDetail.unreadcus) + 1,
      recentMessageTime: Date.parse(new Date().toString()).toString()
    };
    if (role == 'store') {
      data.store_id = this.main.LoggedUserStoreInfo.store_id
    }

    this._helpService.updateChatCount(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  sendChatNotification(type: any, message) {
    if (this.generalSetting.chat_notification_seller == 1) {
      var data: any = {
        user_id: this.main.LoggedUserInfo.user_id,
        role_id: this.loginUser.role_id,
        order_id: this.clickOrderDetail.orderId,
        type: type,
        message: message,
      };

      this._helpService.sendChatNotification(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
        },
        complete: () => { },
      });
    }
  }

  openLocation() {
    const modalRef = this.modalService.open(ShareLocationModelComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.shareLocation.subscribe((url: any) => {
      this.sendLocation(url)
    });
  }

  sendLocation(url: any) {
    const inputImage = {
      message: url,
      title: null,
      fileName: "",
      itemfrom: "",
      readstatus: "no",
      type: 4,
      sender: this.sellerDetails.name,
      user_id: this.sellerDetails.user_id,
      time: serverTimestamp(),
      logo: this.sellerDetails.store_logo,
      showtime: Date.parse(new Date().toString()).toString(),
    };
    setTimeout(() => this.scrollToElement(), 1000);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .collection("messages")
      .add(inputImage);
    this.groupsCollection
      .doc(this.clickOrderDetail.groupId)
      .update({ unreadCustomerMessages: this.clickOrderDetail.unreadcus + 1, recentMessageTime: Date.parse(new Date().toString()).toString() });
    this.updateChatCount()
    this.sendChatNotification(4, inputImage.message)
    this.scrollToBottom();
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '111'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '111'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '111'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}
