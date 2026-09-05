import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvestorDashboardPage } from './investor-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: InvestorDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvestorDashboardPageRoutingModule {}
