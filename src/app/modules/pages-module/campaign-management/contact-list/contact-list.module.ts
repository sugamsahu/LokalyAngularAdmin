import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ContactListComponent } from "./contact-list.component";
import { AddContactListComponent } from "./add-contact-list/add-contact-list.component";
import { CommonModule } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { Search } from "./search";

@NgModule({
  declarations: [ContactListComponent, AddContactListComponent, Search],
  imports: [
    CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: ContactListComponent },
      { path: "add", component: AddContactListComponent },
      { path: "edit", component: AddContactListComponent },
    ]),
    CommonModule,
    MatExpansionModule,
  ],
  bootstrap: [AddContactListComponent],
})
export class ContactListModule { }
