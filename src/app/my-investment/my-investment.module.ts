import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyInvestmentPageRoutingModule } from './my-investment-routing.module';

import { MyInvestmentPage } from './my-investment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyInvestmentPageRoutingModule
  ],
  declarations: [MyInvestmentPage]
})
export class MyInvestmentPageModule {}
