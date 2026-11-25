import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { ChatSupportComponent } from "./chat-support.component";
import { SortPipe } from "../util/sort.pipe";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { ViewChatSupportImageComponent } from "../model/view-chat-support-image/view-chat-support-image.component";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";

@NgModule({
  declarations: [ChatSupportComponent, ViewChatSupportImageComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ChatSupportComponent },
    ]),
    PickerModule,
    CommonApplicationModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
  ],
  providers: [SortPipe],
})
export class ChatSupportModule { }
