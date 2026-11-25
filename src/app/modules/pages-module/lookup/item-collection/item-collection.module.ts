import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ItemCollectionAddComponent } from "./item-collection-add/item-collection-add.component";
import { ItemCollectionComponent } from "./item-collection.component";

@NgModule({
  declarations: [ItemCollectionComponent, ItemCollectionAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ItemCollectionComponent },
      { path: "add", component: ItemCollectionAddComponent },
      { path: "edit", component: ItemCollectionAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ItemCollectionModule { }
