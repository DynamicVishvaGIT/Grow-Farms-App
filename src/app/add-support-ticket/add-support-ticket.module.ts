import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSupportTicketPageRoutingModule } from './add-support-ticket-routing.module';

import { AddSupportTicketPage } from './add-support-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddSupportTicketPageRoutingModule
  ],
  declarations: [AddSupportTicketPage]
})
export class AddSupportTicketPageModule {}
