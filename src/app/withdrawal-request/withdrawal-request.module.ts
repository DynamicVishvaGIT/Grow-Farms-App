import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WithdrawalRequestPageRoutingModule } from './withdrawal-request-routing.module';

import { WithdrawalRequestPage } from './withdrawal-request.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WithdrawalRequestPageRoutingModule
  ],
  declarations: [WithdrawalRequestPage]
})
export class WithdrawalRequestPageModule {}
