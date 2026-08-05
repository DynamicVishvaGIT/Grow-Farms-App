import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentReceiptPageRoutingModule } from './payment-receipt-routing.module';

import { PaymentReceiptPage } from './payment-receipt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentReceiptPageRoutingModule
  ],
  declarations: [PaymentReceiptPage]
})
export class PaymentReceiptPageModule {}
