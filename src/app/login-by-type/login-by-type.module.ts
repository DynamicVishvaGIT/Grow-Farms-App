import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginByTypePageRoutingModule } from './login-by-type-routing.module';

import { LoginByTypePage } from './login-by-type.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginByTypePageRoutingModule
  ],
  declarations: [LoginByTypePage]
})
export class LoginByTypePageModule {}
