import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvestorDashboardPageRoutingModule } from './investor-dashboard-routing.module';

import { InvestorDashboardPage } from './investor-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvestorDashboardPageRoutingModule
  ],
  declarations: [InvestorDashboardPage]
})
export class InvestorDashboardPageModule {}
