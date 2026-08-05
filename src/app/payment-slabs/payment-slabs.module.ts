import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentSlabsPageRoutingModule } from './payment-slabs-routing.module';

import { PaymentSlabsPage } from './payment-slabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentSlabsPageRoutingModule
  ],
  declarations: [PaymentSlabsPage]
})
export class PaymentSlabsPageModule {}
