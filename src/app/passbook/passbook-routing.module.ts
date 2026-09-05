import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PassbookPage } from './passbook.page';

const routes: Routes = [
  {
    path: '',
    component: PassbookPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PassbookPageRoutingModule {}
