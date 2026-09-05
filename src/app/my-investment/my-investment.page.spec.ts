import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyInvestmentPage } from './my-investment.page';

describe('MyInvestmentPage', () => {
  let component: MyInvestmentPage;
  let fixture: ComponentFixture<MyInvestmentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyInvestmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
