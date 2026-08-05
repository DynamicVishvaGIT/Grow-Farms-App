import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { Common } from '../common';
import { Api } from '../api';

// Model Interface
export interface LoginData {
  mobile_no: string;
  user_type: string;
}

@Component({
  selector: 'app-login-by-type',
  templateUrl: './login-by-type.page.html',
  styleUrls: ['./login-by-type.page.scss'],
  standalone: false,
})
export class LoginByTypePage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  loginData: LoginData = {
    mobile_no: '',
    user_type: '',
  };
  
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private navCtrl: NavController, private commonService: Common, private apiService: Api) { 
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
  }

  onLogin() {
    // if (!this.loginData.username || this.loginData.username.trim().length < 10) {
    if (!this.loginData.mobile_no) {
      this.commonService.showToastMessage('Enter the mobile number.', 'toast-error','', 2000);
      return;
    }
    let mPattern = /(^\d{10}$)/;
    if (!mPattern.test(this.loginData.mobile_no)) {
      this.commonService.showToastMessage('Please enter mobile number in correct format.', 'toast-error', 'top', 2000);
      return;
    }
    this.commonService.presentLoading();
    let formData = new FormData();
    formData.append("mobile_no",this.loginData.mobile_no),
    formData.append("user_type",this.commonService.user_type),
    this.apiService.send_otp(formData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.commonService.showToastMessage(response.message, 'toast-success','', 2000);
      this.commonService.dismissLoading();
      // this.router.navigate(['/verify-otp'], { 
      //   state: { mobileNumber: this.loginData.mobile_no, otp: response.otp } 
      // });
      this.router.navigate(['/verify-otp', this.loginData.mobile_no, response.otp]);
      this.loginData.mobile_no = '';
    },
    respError => {console.log(respError);
      this.commonService.dismissLoading();
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

}
