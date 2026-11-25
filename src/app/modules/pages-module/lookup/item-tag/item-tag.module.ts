import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ItemTagAddComponent } from "./item-tag-add/item-tag-add.component";
import { ItemTagComponent } from "./item-tag.component";

@NgModule({
  declarations: [ItemTagComponent, ItemTagAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ItemTagComponent },
      { path: "add", component: ItemTagAddComponent },
      { path: "edit", component: ItemTagAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ItemTagModule {}
