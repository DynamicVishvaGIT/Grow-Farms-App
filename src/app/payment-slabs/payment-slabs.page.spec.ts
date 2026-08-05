import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentSlabsPage } from './payment-slabs.page';

describe('PaymentSlabsPage', () => {
  let component: PaymentSlabsPage;
  let fixture: ComponentFixture<PaymentSlabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSlabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
