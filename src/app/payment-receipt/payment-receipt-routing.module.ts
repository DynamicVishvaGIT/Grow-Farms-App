import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentReceiptPage } from './payment-receipt.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentReceiptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentReceiptPageRoutingModule {}
