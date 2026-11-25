import { Subject, takeUntil } from "rxjs";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { SellerService } from "src/app/services/seller.service";
import { ToastrService } from "ngx-toastr";
import { cloneDeep } from "lodash";

@Component({
  selector: "app-item-collection-add",
  templateUrl: "./item-collection-add.component.html",
  styleUrls: ["./item-collection-add.component.scss"],
})
export class ItemCollectionAddComponent implements OnInit, AfterViewInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  destroy$ = new Subject();
  item_group_id: any;
  main: any;
  formGroup: FormGroup;
  collection_master_list: any = [];
  selected_items: any = [];
  total_count: number = 0;
  selectedCollection: any;
  @ViewChild('cursor') cursor: ElementRef;
  userRoleEnum = UserRoles;
  AllowManageItem: boolean = false;
  IsStoreManager: boolean = false;
  seller_list: any = [];
  iseatery: any;
  is_super_admin: boolean;
  storeId: string;
  customer_User_Id: any = 0;

  constructor(
    private router: Router,
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService,
    private sellerService: SellerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/items/itemcollectionedit") > -1) {
      this.item_group_id = this.cryptoService.decryptIdValue(
        "itemCollectionId" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
        this.main.CryptoKey
      );
      if (this.item_group_id == undefined) {
        this.router.navigate(["/items/itemcollection"]);
      }
    }
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.is_super_admin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;
    if (this.is_super_admin) {
      this.storeId = this.cryptoService.decryptIdValue(
        "selectedStore" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
        this.main.CryptoKey
      );
    }
    this.loadForm();
    if (this.is_super_admin) {
      this.getSellerList();
    } else {
      this.getMasterData();
    }
    if (this.main.LoggedUserStoreInfo.role_id == this.userRoleEnum.StoreManager) {
      this.IsStoreManager = true;
      this.getStoreManagerSettings()
    }
  }

  loadForm(description?: string) {
    if (this.is_super_admin) {
      this.formGroup = this.formBuilder.group({
        description: [description ? description : ""],
        selectedCollection: [null],
        selectedStore: [null],
      });
    } else {
      this.formGroup = this.formBuilder.group({
        description: [description ? description : ""],
        selectedCollection: [null],
        selectedStore: [null],
      });
    }
  }

  getSellerList() {
    let data: any = {
      is_verified: 2,
      khata_user: 0,
      market_type: 2
    };
    this.sellerService.getSellerList(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.seller_list = response.data;
          this.formGroup.controls['selectedStore'].setValue(this.seller_list.filter(store => store.store_id == this.storeId)[0])
          this.getMasterData()
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
        //
      },
    });
  }

  getMasterData() {
    var data = {
      store_id:
        this.is_super_admin == true
          ? this.formGroup.value.selectedStore.store_id
          : this.main.LoggedUserStoreInfo.store_id,
    };
    this.itemService.getCollectionMasterData(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.total_count = response.count;
          if (this.item_group_id == undefined) {
            response.data.forEach((item) => {
              if (item.is_added == 0) {
                this.collection_master_list.push(item);
              }
            });
          } else {
            this.collection_master_list = response.data;
          }
          this.cdr.detectChanges();
          if (this.item_group_id != undefined) {
            this.getItemDataById();
          }
          this.collection_master_list = this.collection_master_list.filter((x) => x.collection_type == 1)
        } else {
          this.collection_master_list = [];
          this.total_count = 0;
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id
    }
    this.commonService.getStoreSetting(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.data.manage_item == 1) {
          this.AllowManageItem = true;
        } else {
          this.AllowManageItem = false;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    })
  }

  getItemDataById() {
    var data = {
      seller_item_collection_id: this.item_group_id,
    };
    this.itemService.getStoreCollectionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.selectedCollection = this.collection_master_list.filter(
            (x) => x.item_collection_id == response.data.item_collection_id
          )[0];
          this.formGroup.controls["selectedCollection"].setValue(
            this.selectedCollection
          );
          this.formGroup.controls["selectedCollection"].disable();
          this.formGroup.controls["description"].setValue(
            response.data.description
          );

          if (this.selectedCollection.collection_type == 1) {
            this.selected_items = response.data.items;
            this.selected_items.forEach((element) => {
              element.quantity = 1;
            });
          }
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  openSelectItem() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.foritemcollection = true;
    modalRef.componentInstance.selectedSeller = this.formGroup.value.selectedStore;
    modalRef.componentInstance.isSuperAdmin = this.is_super_admin;
    modalRef.componentInstance.seller_item_collection_id = this.item_group_id;
    modalRef.componentInstance.initialSelectedItems = cloneDeep(this.selected_items);
    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.selected_items = items;
    });
  }

  changeMasterObject(event) {
    this.formGroup.controls["description"].setValue(
      event.description
    );
    this.selectedCollection = event;
  }

  changeStore() {
    this.collection_master_list = [];
    this.formGroup.controls["selectedCollection"].setValue(null);
    this.getMasterData();
  }

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  onSubmit() {
    if (this.selectedCollection?.collection_type == 1) {
      if (
        this.selected_items == null ||
        this.selected_items == undefined ||
        this.selected_items == 0
      ) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_ITEM")
        );
        return;
      }
    }
    if (!this.selectedCollection) {
      if (
        this.selected_items == null ||
        this.selected_items == undefined ||
        this.selected_items == 0
      ) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_ITEM")
        );
        return;
      }
    }
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      var itemIdlist = "";
      if (this.selectedCollection.collection_type == 1) {
        if (this.selected_items.length > 1) {
          this.selected_items.forEach((value) => {
            itemIdlist += value["item_id"] + ",";
          });
        } else {
          itemIdlist = this.selected_items[0]["item_id"];
        }
        if (this.selected_items.length > 1) {
          itemIdlist = itemIdlist.substring(0, itemIdlist.length - 1);
        }
      }
      var fd = new FormData();
      if (this.item_group_id != undefined) {
        fd.append("seller_item_collection_id", this.item_group_id);
      }
      fd.append(
        "item_collection_id",
        this.selectedCollection.item_collection_id
      );
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("store_id", this.is_super_admin == true
        ? this.formGroup.value.selectedStore.store_id
        : this.main.LoggedUserStoreInfo.store_id);
      fd.append("description", this.formGroup.value.description);
      fd.append("item_id", itemIdlist);
      fd.append("is_active", "1");
      this.itemService.addEditCollection(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message);
            this.router.navigate(["/items/itemcollection"]);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => { },
      });
    }
  }
}
