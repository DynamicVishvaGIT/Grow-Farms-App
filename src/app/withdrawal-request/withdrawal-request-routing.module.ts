import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WithdrawalRequestPage } from './withdrawal-request.page';

const routes: Routes = [
  {
    path: '',
    component: WithdrawalRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WithdrawalRequestPageRoutingModule {}
