import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddSupportTicketPage } from './add-support-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: AddSupportTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddSupportTicketPageRoutingModule {}
