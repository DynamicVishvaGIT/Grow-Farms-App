import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentListPageRoutingModule } from './document-list-routing.module';

import { DocumentListPage } from './document-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentListPageRoutingModule
  ],
  declarations: [DocumentListPage]
})
export class DocumentListPageModule {}
