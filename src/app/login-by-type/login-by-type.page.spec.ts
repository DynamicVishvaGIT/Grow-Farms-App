import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginByTypePage } from './login-by-type.page';

describe('LoginByTypePage', () => {
  let component: LoginByTypePage;
  let fixture: ComponentFixture<LoginByTypePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginByTypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
