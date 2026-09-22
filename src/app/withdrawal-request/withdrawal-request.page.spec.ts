import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithdrawalRequestPage } from './withdrawal-request.page';

describe('WithdrawalRequestPage', () => {
  let component: WithdrawalRequestPage;
  let fixture: ComponentFixture<WithdrawalRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawalRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
