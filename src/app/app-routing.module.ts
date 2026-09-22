import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login-by-type',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login-by-type',
    loadChildren: () => import('./login-by-type/login-by-type.module').then( m => m.LoginByTypePageModule)
  },
  {
    path: 'verify-otp/:mobile_no/:otp',
    loadChildren: () => import('./verify-otp/verify-otp.module').then( m => m.VerifyOtpPageModule)
  },
  {
    path: 'my-bookings',
    loadChildren: () => import('./my-bookings/my-bookings.module').then( m => m.MyBookingsPageModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./my-profile/my-profile.module').then( m => m.MyProfilePageModule)
  },
  {
    path: 'booking-details/:booking_id/:property_id',
    loadChildren: () => import('./booking-details/booking-details.module').then( m => m.BookingDetailsPageModule)
  },
  {
    path: 'payment-slabs',
    loadChildren: () => import('./payment-slabs/payment-slabs.module').then( m => m.PaymentSlabsPageModule)
  },
  {
    path: 'document-list',
    loadChildren: () => import('./document-list/document-list.module').then( m => m.DocumentListPageModule)
  },
  {
    path: 'payment-receipt',
    loadChildren: () => import('./payment-receipt/payment-receipt.module').then( m => m.PaymentReceiptPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'add-support-ticket',
    loadChildren: () => import('./add-support-ticket/add-support-ticket.module').then( m => m.AddSupportTicketPageModule)
  },
  {
    path: 'make-payment-receipt/:property_id',
    loadChildren: () => import('./make-payment-receipt/make-payment-receipt.module').then( m => m.MakePaymentReceiptPageModule)
  },
  {
    path: 'ticket-details/:ticket_id',
    loadChildren: () => import('./ticket-details/ticket-details.module').then( m => m.TicketDetailsPageModule)
  },
  {
    path: 'investor-dashboard',
    loadChildren: () => import('./investor-dashboard/investor-dashboard.module').then( m => m.InvestorDashboardPageModule)
  },
  {
    path: 'passbook/:booking_id',
    loadChildren: () => import('./passbook/passbook.module').then( m => m.PassbookPageModule)
  },
  {
    path: 'my-investment',
    loadChildren: () => import('./my-investment/my-investment.module').then( m => m.MyInvestmentPageModule)
  },
  {
    path: 'withdrawal-request/:booking_id',
    loadChildren: () => import('./withdrawal-request/withdrawal-request.module').then( m => m.WithdrawalRequestPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
