import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentSlabsPage } from './payment-slabs.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentSlabsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentSlabsPageRoutingModule {}
