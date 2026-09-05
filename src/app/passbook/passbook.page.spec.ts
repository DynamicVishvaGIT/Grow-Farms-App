import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PassbookPage } from './passbook.page';

describe('PassbookPage', () => {
  let component: PassbookPage;
  let fixture: ComponentFixture<PassbookPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PassbookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
