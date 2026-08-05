import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Common } from '../common';
import { Api } from '../api';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../user';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html',
  styleUrls: ['./verify-otp.page.scss'],
  standalone: false,
})
export class VerifyOtpPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  @ViewChildren('input0, input1, input2, input3') inputs!: QueryList<ElementRef>;

  otp: string[] = ['', '', '', ''];
  mobileNumber: string = '';
  receivedOTP:string='';
  timer: number = 30;
  interval: any;
  canResend: boolean = false; // 👈 controls when button shows
  resendCount = 0;
  maxResendLimit = 3;

  constructor(
    private alertController: AlertController,private router: Router,private location: Location,private commonService: Common, private apiService: Api,
    private navCtrl: NavController, private userService: User, private route: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // Auto focus on first input
    setTimeout(() => {
      const firstInput = this.inputs.toArray()[0];
      if (firstInput) {
        firstInput.nativeElement.focus();
      }
    }, 500);
    this.receivedOTP = '';
    this.mobileNumber = '';
    const mobile_no = this.route.snapshot.paramMap.get('mobile_no');
    const otp = this.route.snapshot.paramMap.get('otp');
    if (mobile_no) {
      this.mobileNumber = mobile_no;
    }
    if(otp){
      this.receivedOTP = otp;
    }
    // const navigation = this.router.getCurrentNavigation();
    // if (navigation?.extras.state) {
    //   this.mobileNumber = navigation.extras.state['mobileNumber'];
    //   this.receivedOTP = navigation.extras.state['otp'];
    //   console.log('Received mobile number:', this.mobileNumber);
    // } else {
    //   // fallback if user reloads or navigates directly
    //   const state = this.location.getState() as { mobileNumber?: string };
    //   this.mobileNumber = state?.mobileNumber ?? '';
    //   console.log('Fallback mobile number:', this.mobileNumber);
    // }
    this.startCountdown();
  }

  startCountdown() {
    this.timer = 30;
    this.canResend = false; // hide the link
    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.interval);
        this.canResend = true; // 👈 show "Resend OTP" link
      }
    }, 1000);
  }

  onClickResend() {
    if (!this.canResend || this.resendCount >= this.maxResendLimit) return;
  
    this.resendCount++;
    this.canResend = false; // Hide the link while waiting
    this.resendOtp(); // Call API
    this.startCountdown(); // Restart timer
  }

  verifyOTP() {
    const otp = this.otp.join('');
    console.log('Verifying OTP:', otp);
    if (otp.length !== 4) {
      this.commonService.showToastMessage('Please enter complete OTP', 'toast-error','', 4000);
      return;
    }
    this.commonService.presentLoading();
    let formData = new FormData();
    formData.append("mobile_no",this.mobileNumber),
    formData.append("otp",otp),
    formData.append("user_type",this.commonService.user_type),
    this.apiService.verify_otp(formData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      let user = response.user_details;
      user.user_id = response.user_id;
      user.session_id = response.session_id;
      user.user_type = response.user_type;
      console.log(user);
      this.userService.setCurrentUser(user);
      localStorage.setItem('currentUser',JSON.stringify(user));
      this.commonService.showToastMessage(response.message, 'toast-success','', 2000);
      this.commonService.dismissLoading();
      this.clearOtp();
      this.navCtrl.navigateRoot('/home');
    },
    respError => {
      this.commonService.dismissLoading();
      this.clearOtp();
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  resendOtp() {
    this.commonService.presentLoading();
    let formData = new FormData();
    formData.append("mobile_no",this.mobileNumber),
    formData.append("user_type",this.commonService.user_type),
    this.apiService.resend_otp(formData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.receivedOTP = response.otp;
      this.commonService.showToastMessage(response.message, 'toast-success','', 2000);
      this.commonService.dismissLoading();
      this.clearOtp();
    },
    respError => {
      this.commonService.dismissLoading();
      this.clearOtp();
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value;
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      this.otp[index] = '';
      event.target.value = '';
      return;
    }
    this.otp[index] = value;
    // Move to next input if value is entered
    if (value && index < 3) {
      const nextInput = this.inputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
    // Auto verify if all inputs are filled
    if (this.otp.every(digit => digit !== '')) {
      // Optional: Auto submit after a short delay
      // setTimeout(() => this.verifyOtp(), 500);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Handle backspace
    if (event.key === 'Backspace') {
      if (this.otp[index] === '' && index > 0) {
        // Move to previous input if current is empty
        const prevInput = this.inputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
        }
      } else {
        // Clear current input
        this.otp[index] = '';
      }
    }
    // Handle arrow keys
    else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.inputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    } else if (event.key === 'ArrowRight' && index < 3) {
      const nextInput = this.inputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
  }

  // async verifyOtp() {
  //   const otpValue = this.otp.join('');

  //   // Validate OTP
  //   if (otpValue.length !== 4) {
  //     await this.showAlert('Error', 'Please enter complete OTP');
  //     return;
  //   }

  //   // Here you would typically call your API to verify the OTP
  //   console.log('Verifying OTP:', otpValue);

  //   // Simulate API call
  //   setTimeout(async () => {
  //     // Check if OTP is correct (example: 6789)
  //     if (otpValue === '6789') {
  //       await this.showAlert('Success', 'OTP verified successfully!');
  //       // Navigate to home or dashboard
  //       this.navCtrl.navigateForward('/home');
  //     } else {
  //       await this.showAlert('Error', 'Invalid OTP. Please try again.');
  //       this.clearOtp();
  //     }
  //   }, 1000);
  // }

  // async resendOtp() {
  //   // Here you would typically call your API to resend OTP
  //   console.log('Resending OTP to:', this.mobileNumber);
  //   await this.showAlert('Success', 'OTP has been resent to your mobile number');
  //   this.clearOtp();
  // }

  async changeNumber() {
    // Navigate back to phone number entry screen
    console.log('Change number clicked');
    // this.navCtrl.navigateBack('/phone-verification');
    
    await this.showAlert('Info', 'Redirecting to change mobile number...');
  }

  clearOtp() {
    this.otp = ['', '', '', ''];
    const firstInput = this.inputs.toArray()[0];
    if (firstInput) {
      firstInput.nativeElement.focus();
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

}
