import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyInvestmentPage } from './my-investment.page';

const routes: Routes = [
  {
    path: '',
    component: MyInvestmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyInvestmentPageRoutingModule {}
