import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MakePaymentReceiptPage } from './make-payment-receipt.page';

describe('MakePaymentReceiptPage', () => {
  let component: MakePaymentReceiptPage;
  let fixture: ComponentFixture<MakePaymentReceiptPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MakePaymentReceiptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
