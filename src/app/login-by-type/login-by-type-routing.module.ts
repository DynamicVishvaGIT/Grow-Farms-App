import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginByTypePage } from './login-by-type.page';

const routes: Routes = [
  {
    path: '',
    component: LoginByTypePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginByTypePageRoutingModule {}
