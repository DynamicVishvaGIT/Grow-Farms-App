import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentReceiptPage } from './payment-receipt.page';

describe('PaymentReceiptPage', () => {
  let component: PaymentReceiptPage;
  let fixture: ComponentFixture<PaymentReceiptPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentReceiptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
