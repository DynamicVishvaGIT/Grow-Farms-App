import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { Common } from './common';

@Injectable({
  providedIn: 'root',
})
export class Api {
  
  baseUrl = '';

  constructor(public httpClient: HttpClient, public commonService: Common) { 
    this.baseUrl = this.commonService.getBaseURL();
    // this.headers = this.commonService.getHeaders();
  }

  send_otp(user:any) {
    return this.httpClient.post(this.baseUrl + 'send_otp', user)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  verify_otp(user:any) {
    return this.httpClient.post(this.baseUrl + 'verify_otp', user)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  resend_otp(user:any) {
    return this.httpClient.post(this.baseUrl + 'resend_otp', user)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  load_my_booking(book:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('login_user_id', book.login_user_id);
    urlSearchParams.append('booking_status', book.booking_status);
    return this.httpClient.get(this.baseUrl + 'load_my_booking?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  view_user_details_and_booking_details(booking:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', booking.user_id);
    urlSearchParams.append('booking_id', booking.booking_id);
    urlSearchParams.append('property_id', booking.property_id);
    return this.httpClient.get(this.baseUrl + 'view_user_details_and_booking_details?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  load_customer_documents(documents:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', documents.user_id);
    urlSearchParams.append('category_name', documents.category_name);
    return this.httpClient.get(this.baseUrl + 'load_customer_documents?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  load_property() {
    return this.httpClient.get(this.baseUrl + 'load_property')
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  load_dashboard_property(property:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', property.user_id);
    return this.httpClient.get(this.baseUrl + 'load_dashboard_property?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  load_support_ticket_details(ticket:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', ticket.user_id);
    return this.httpClient.get(this.baseUrl + 'load_support_ticket_details?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  add_ticket(ticket:any) {
    return this.httpClient.post(this.baseUrl + 'add_ticket', ticket)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  view_ticket_details_mobile_app(ticket:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('ticket_id', ticket.ticket_id);
    return this.httpClient.get(this.baseUrl + 'view_ticket_details_mobile_app?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  get_payment_slabs(payment:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('login_user_id', payment.login_user_id);
    urlSearchParams.append('payment_status', payment.payment_status);
    urlSearchParams.append('property_id', payment.property_id);
    return this.httpClient.get(this.baseUrl + 'get_payment_slabs?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  make_payments(payment:any) {
    return this.httpClient.post(this.baseUrl + 'make_payments', payment)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  view_payment_receipts(payment:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', payment.user_id);
    urlSearchParams.append('payment_slab_id', payment.payment_slab_id);
    urlSearchParams.append('payment_status', payment.payment_status);
    urlSearchParams.append('property_id', payment.property_id);
    return this.httpClient.get(this.baseUrl + 'view_payment_receipts?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  customer_dashboard(payment:any) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('user_id', payment.user_id);
    urlSearchParams.append('property_id', payment.property_id);
    return this.httpClient.get(this.baseUrl + 'customer_dashboard?' +urlSearchParams.toString())
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    )
  }

  errorHandler(error: any = Response) {
    console.log(error);
    // Prefer message inside error.error.message if available
    let message = error?.error?.message || error?.error?.error || error?.message || 'Remote server unreachable. Please check your Internet connection.';
    return throwError(() => message);
  }
}
