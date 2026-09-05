import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Api } from '../api';
import { Common } from '../common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  accounts: any[] = [];
  mobileNumber: string = '';
  selectedAccount: any = null;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private apiService: Api,
    private commonService: Common
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (state) {
      this.accounts = state['accounts'] || [];
      this.mobileNumber = state['mobile_no'] || '';
    }
    console.log('Accounts:', this.accounts);
    console.log('Mobile Number:', this.mobileNumber);
  }

  /** Investor / End User login selection*/
  navigateToLoginByType() {
    console.log('Navigating to End User Login');
    this.selectAccountByType('User');
  }

  /*** Select account*/
  selectAccountByType(type: string) {
    console.log('Selected Type:', type);
    const account = this.accounts.find(
      (item: any) =>
        item.user_type?.toLowerCase() === type.toLowerCase()
    );
    if (!account) {
      this.commonService.showToastMessage(`${type} account not found`,'toast-error','',
        4000
      );
      return;
    }
    console.log('Selected Account:', account);
    this.selectedAccount = account;
    this.selectAccount(account);
  }

  /*** Call select_account API*/
  selectAccount(account: any) {
    this.commonService.presentLoading();
    const formData = new FormData();
    formData.append('user_id',String(account.user_id));
    formData.append('mobile_no',this.mobileNumber);
    console.log('select_account payload:', {
      user_id: account.user_id,
      mobile_no: this.mobileNumber
    });
    this.apiService.select_account(formData)
      .subscribe(
        (response: any) => {
          console.log('Select Account Response:', response);
          this.commonService.dismissLoading();
          if (!response || !response.status) {
            this.commonService.showToastMessage(response?.message || 'Unable to login','toast-error','',4000);
            return;
          }
          /** Store tokens if returned by API */
          if (response.access_token) {
            localStorage.setItem('access_token',response.access_token);
          }
          if (response.refresh_token) {
            localStorage.setItem('refresh_token',response.refresh_token);
          }
          /** Store user details if required*/
          if (response.user_id) {
            localStorage.setItem('user_id',String(response.user_id));
          }
          if (response.user_type) {
            localStorage.setItem('user_type',response.user_type);
          }
          /** Redirect based on selected user type*/
          const userType = response.user_type || account.user_type;
          if (userType === 'User') {
            this.router.navigate(['/home']);
          } 
          else if (userType === 'Investor') {
            this.router.navigate(['/investor-dashboard']);
          } 
          else {
            this.commonService.showToastMessage('Invalid user type','toast-error','',4000);
          }
        },
        (error) => {
          console.error('Select Account API Error:',error);
          this.commonService.dismissLoading();
          this.commonService.showToastMessage(error?.error?.message || error?.message || 'Something went wrong','toast-error','',4000);
        }
      );
  }
}
// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { NavController } from '@ionic/angular';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.page.html',
//   styleUrls: ['./login.page.scss'],
//   standalone: false,
// })
// export class LoginPage implements OnInit {

//   constructor(private router: Router) { }

//   ngOnInit() {
//   }

//   /*** Navigate to End User Login Page*/
//   navigateToLoginByType() {
//     console.log('Navigating to End User Login');
//     this.router.navigate(['/login-by-type']);
//   }

// }
