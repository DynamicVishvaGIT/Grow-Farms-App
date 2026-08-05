import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSupportTicketPage } from './add-support-ticket.page';

describe('AddSupportTicketPage', () => {
  let component: AddSupportTicketPage;
  let fixture: ComponentFixture<AddSupportTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupportTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
