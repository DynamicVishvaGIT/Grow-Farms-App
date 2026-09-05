import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestorDashboardPage } from './investor-dashboard.page';

describe('InvestorDashboardPage', () => {
  let component: InvestorDashboardPage;
  let fixture: ComponentFixture<InvestorDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
