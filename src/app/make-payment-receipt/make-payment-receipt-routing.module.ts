import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MakePaymentReceiptPage } from './make-payment-receipt.page';

const routes: Routes = [
  {
    path: '',
    component: MakePaymentReceiptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MakePaymentReceiptPageRoutingModule {}
