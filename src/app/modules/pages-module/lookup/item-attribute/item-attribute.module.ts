import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ItemAttributeAddComponent } from "./item-attribute-add/item-attribute-add.component";
import { ItemAttributeComponent } from "./item-attribute.component";

@NgModule({
  declarations: [ItemAttributeComponent, ItemAttributeAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ItemAttributeComponent },
      { path: "add", component: ItemAttributeAddComponent },
      { path: "edit", component: ItemAttributeAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ItemAttributeModule { }
