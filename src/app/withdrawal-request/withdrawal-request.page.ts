import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { Api } from '../api';
import { Common } from '../common';
import { User } from '../user';
import {
  ActionSheetController,
  AlertController,
  ToastController
} from '@ionic/angular';

@Component({
  selector: 'app-withdrawal-request',
  templateUrl: './withdrawal-request.page.html',
  styleUrls: ['./withdrawal-request.page.scss'],
  standalone: false,
})
export class WithdrawalRequestPage {

  private _unsubscribeAll: Subject<any>;

  currentUser: any;
  booking_id: string = '';
  withdrawalAmount: string = '0';
  activeNav: string = 'Payment';
  showConfirmModal: boolean = false;
  showSuccessModal: boolean = false;
  withdrawalDetails: any = null;
  /*** Percentage of the progress bar occupied* by eligible amount.*/
  eligibleProgress: number = 0;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private apiService: Api,
    private commonService: Common,
    private userService: User,
    private route: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.userService.currentUser$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        if (user) {
          this.currentUser = user;
          console.log('39', this.currentUser);
        } 
        else {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            console.log('44', this.currentUser);
          }
        }
    });
    const booking_id = this.route.snapshot.paramMap.get('booking_id');
    if (booking_id) {
      this.booking_id = booking_id;
      this.load_withdrawal_details();
    }
    this.router.events.pipe(filter((event): event is NavigationEnd =>event instanceof NavigationEnd),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/withdrawal-request')) {
          this.load_withdrawal_details();
        }
      });
  }
  doRefresh(event: any) {
    setTimeout(() => {
      this.load_withdrawal_details();
      event.target.complete();
    }, 2000);
  }

  mobile_create_withdraw_request() {
    let withdrawalJson:any={booking_id:'', withdraw_amount:'',notes:'Withdrawal request'};
    withdrawalJson.booking_id = this.booking_id;
    withdrawalJson.withdraw_amount = this.withdrawalAmount;
    this.apiService.mobile_create_withdraw_request(withdrawalJson)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (response: any) => {
          console.log('Withdrawal Details:', response);
          this.showConfirmModal = false;
          this.showSuccessModal = true;
        },
        respError => {
          this.commonService.showToastMessage(respError,'toast-error','',4000);
        }
      );
  }

  load_withdrawal_details() {
    if (!this.booking_id) {
      return;
    }
    this.apiService
      .load_withdrawal_details(this.booking_id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (response: any) => {
          console.log('Withdrawal Details:', response);
          if (response?.status && response?.data) {
            this.withdrawalDetails = response.data;
            this.calculateProgress();
            console.log('Withdrawal Details Data:',this.withdrawalDetails);
            console.log('Eligible Progress:',this.eligibleProgress);
          }
        },
        respError => {
          this.commonService.showToastMessage(respError,'toast-error','',4000);
        }
      );
  }
  /*** Calculate progress based on:** Eligible Amount + Locked Amount** Example:* Eligible = 100000* Locked = 0** Progress = 100%*/
  calculateProgress() {
    const eligible = Number(this.withdrawalDetails?.withdrawal_eligibility?.eligible_amount) || 0;
    const locked = Number(this.withdrawalDetails?.withdrawal_eligibility?.locked_amount) || 0;
    const total = eligible + locked;
    if (total === 0) {
      this.eligibleProgress = 0;
      return;
    }
    this.eligibleProgress = Number(((eligible / total) * 100).toFixed(2));
  }
  onNavClick(navName: string) {
    this.activeNav = navName;
  }
  openConfirmModal() {
    const amount = Number(this.withdrawalAmount) || 0;
    const remainingLimit = Number(this.withdrawalDetails?.withdrawal_eligibility?.remaining_limit) || 0;
    if (amount <= 0) {
      this.commonService.showToastMessage('Please enter a valid withdrawal amount','toast-error','',4000);
      return;
    }
    if (amount > remainingLimit) {
      this.commonService.showToastMessage('Withdrawal amount cannot exceed the remaining limit','toast-error', '',4000);
      return;
    }
    this.showConfirmModal = true;
  }

  closeModals() {
    this.showConfirmModal = false;
    this.showSuccessModal = false;
  }

  // confirmSubmit() {
  //   this.showConfirmModal = false;
  //   this.showSuccessModal = true;
  // }

  finishFlow() {
    this.showSuccessModal = false;
    this.onPassbook();
    // Resets or stays on the withdrawal request page cleanly
  }

  onBack() {
    this.router.navigate(['/my-bookings']);
  }

  onPassbook() {
    // this.router.navigate(['/passbook']);
    this.router.navigate(['/passbook', this.booking_id]);
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}

// import { Component } from '@angular/core';
// import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
// import { filter, Subject, takeUntil } from 'rxjs';
// import { Api } from '../api';
// import { Common } from '../common';
// import { User } from '../user';
// import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';

// @Component({
//   selector: 'app-withdrawal-request',
//   templateUrl: './withdrawal-request.page.html',
//   styleUrls: ['./withdrawal-request.page.scss'],
//   standalone: false,
// })
// export class WithdrawalRequestPage {

//   private _unsubscribeAll: Subject<any>;

//   currentUser:any;
//   booking_id: string='';
//   withdrawalAmount: string = '0';
//   activeNav: string = 'Payment';

//   showConfirmModal: boolean = false;
//   showSuccessModal: boolean = false;

//   navItems = [
//     { name: 'Dashboard', inactiveIcon: 'assets/icons/dashboard.png', activeIcon: 'assets/icons/dashboard-active.png' },
//     { name: 'Booking', inactiveIcon: 'assets/icons/document.png', activeIcon: 'assets/icons/document-active.png' },
//     { name: 'Payment', inactiveIcon: 'assets/icons/payment.png', activeIcon: 'assets/icons/payment-active.png' },
//     { name: 'Document', inactiveIcon: 'assets/icons/document.png', activeIcon: 'assets/icons/document-active.png' },
//     { name: 'Profile', inactiveIcon: 'assets/icons/profile.png', activeIcon: 'assets/icons/profile-active.png' }
//   ];

//   constructor(
//     private router: Router,private alertController: AlertController,private toastController: ToastController,private actionSheetController: ActionSheetController,
//     private apiService: Api, private commonService: Common, private userService: User, private route: ActivatedRoute
//   ) {
//     this._unsubscribeAll = new Subject();
//   }

//   ngOnInit() {
//     // this.loadPaymentSlabs();
//     this.userService.currentUser$.subscribe(user => {
//       if (user) {
//         this.currentUser = user;
//         console.log('39',this.currentUser);
//       } 
//       else {
//         const storedUser = localStorage.getItem('currentUser');
//         if (storedUser) {
//           this.currentUser = JSON.parse(storedUser);
//           console.log('44',this.currentUser);
//         }
//       }
//     });
//     const booking_id = this.route.snapshot.paramMap.get('booking_id');
//     if(booking_id){
//       this.booking_id = booking_id;
//     }
//     this.router.events.pipe(
//       filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
//       ).subscribe((event: NavigationEnd) => {
//         if (event.url.includes('/withdrawal-request')){ // Check if user navigated back to a specific URL
//           this.load_withdrawal_details();
//         }
//     });
//     // this.load_property();
//   }

//   doRefresh(event:any) {
//     setTimeout(() => {
//       this.load_withdrawal_details();
//       event.target.complete();
//     }, 2000);
//   }

//   load_withdrawal_details() {
//     this.apiService.load_withdrawal_details(this.booking_id)
//     .pipe(takeUntil(this._unsubscribeAll))
//     .subscribe((response:any) => {
//       console.log(response);
      
//     },
//     respError => {
//       this.commonService.showToastMessage(respError, 'toast-error','', 4000);
//     })
//   }

//   onNavClick(navName: string) {
//     this.activeNav = navName;
//   }

//   openConfirmModal() {
//     this.showConfirmModal = true;
//   }

//   closeModals() {
//     this.showConfirmModal = false;
//     this.showSuccessModal = false;
//   }

//   confirmSubmit() {
//     this.showConfirmModal = false;
//     this.showSuccessModal = true;
//   }

//   finishFlow() {
//     this.showSuccessModal = false;
//     // Resets or stays on the withdrawal request page cleanly
//   }

//   onBack() {
//     this.router.navigate(['/my-bookings']);
//   }

//   onPassbook() {
//     this.router.navigate(['/passbook']);
//   }
// }