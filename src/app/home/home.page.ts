import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { User } from '../user';
import { Api } from '../api';
import { Common } from '../common';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  private _unsubscribeAll: Subject<any>;

  currentUser: any;
  property_id:string='';
  properties:any=[];
  selectedProperty: string = '';
  dataLoaded:boolean=true;
  dashboardData:any;

  notificationCount: number = 1;

  // Progress Circle Calculations
  circumference: number = 2 * Math.PI * 58; // radius = 58
  dashOffset: number = 0;


  // Property Banner
  propertyBannerUrl: string = 'assets/images/property-banner.png';

  constructor(
    private router: Router,private alertController: AlertController,private toastController: ToastController, private actionSheetController: ActionSheetController,
    private userService: User, private apiService: Api, private commonService: Common
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        console.log('39',this.currentUser);
      } 
      else {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
          console.log('44',this.currentUser);
        }
      }
    });
    // this.calculateProgress();
    // this.loadDashboardData();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url === '/home') { // Check if user navigated back to a specific URL
          this.load_dashboard_property();
        }
    });
    
  }

  doRefresh(event:any) {
    setTimeout(() => {
      this.load_dashboard_property();
      event.target.complete();
    }, 2000);
  }

  load_dashboard_property() {
    let propertyData:any={user_id:''};
    propertyData['user_id'] = this.currentUser.user_id;
    this.apiService.load_dashboard_property(propertyData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.properties = response.data;
      this.selectedProperty = this.properties[0].property_name;
      console.log(this.properties);
      this.property_id = response.data[0].property_id;
      this.customer_dashboard();
    },
    respError => {
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  async selectProperty() {
    const buttons = this.properties.map((property:any) => ({
      text: property.property_name,
      handler: () => {
        this.selectedProperty = property.property_name;
        this.property_id = property.property_id;
        this.customer_dashboard();
      }
    }));

    buttons.push({
      text: 'Cancel',
      handler: () => {}
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Property',
      buttons: buttons
    });

    await actionSheet.present();
  }

  customer_dashboard() {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    let documentData:any={user_id:'',property_id:''};
    documentData['user_id'] = this.currentUser.user_id;
    documentData['property_id'] = this.property_id;
    this.apiService.customer_dashboard(documentData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.dashboardData = response;
      this.calculateProgress();
      this.dataLoaded = true;
      this.commonService.dismissLoading();
    },
    respError => {
      this.commonService.dismissLoading();
      this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }


  /**
   * Calculate progress circle offset
   */
  private calculateProgress() {
    const progress = this.dashboardData?.slab_progress.paid_slabs / this.dashboardData?.slab_progress.total_slabs;
    this.dashOffset = this.circumference - (progress * this.circumference);
  }

  /**
   * Handle notification icon click
   */
  async onNotificationClick() {
    console.log('Notification clicked');
    // TODO: Navigate to notifications page
    this.router.navigate(['/notifications']);
    await this.showToast('Opening notifications...', 'primary');
  }

  /**
   * Handle mark payment button click
   */
  async onMarkPayment() {
    // const alert = await this.alertController.create({
    //   header: 'Mark Payment',
    //   message: `Are you sure you want to mark payment of ₹${this.nextPaymentAmount.toLocaleString('en-IN')}?`,
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       role: 'cancel',
    //       handler: () => {
    //         console.log('Payment cancelled');
    //       }
    //     },
    //     {
    //       text: 'Confirm',
    //       handler: () => {
    //         this.processPayment();
    //       }
    //     }
    //   ]
    // });

    // await alert.present();
  }

  /**
   * Process payment
   */
  // private async processPayment() {
  //   // TODO: Implement actual payment processing logic
  //   console.log('Processing payment...');

  //   // Show loading
  //   await this.showToast('Processing payment...', 'primary');

  //   // Simulate API call
  //   setTimeout(async () => {
  //     // Update data after successful payment
  //     this.amountPaid += this.nextPaymentAmount;
  //     this.balance -= this.nextPaymentAmount;
  //     this.currentSlab++;
  //     this.calculateProgress();

  //     await this.showToast('Payment marked successfully!', 'success');

  //     // Refresh dashboard data
  //     // this.loadDashboardData();
  //   }, 1500);
  // }

  /**
   * Navigate to different tabs
   */
  navigateTo(tab: string) {
    console.log('Navigating to:', tab);
    // TODO: Implement navigation logic
    // this.router.navigate([`/${tab}`]);

    switch (tab) {
      case 'dashboard':
        // Already on dashboard
        break;
      case 'booking':
        // this.router.navigate(['/booking']);
        this.showToast('Booking page', 'primary');
        break;
      case 'payment':
        // this.router.navigate(['/payment']);
        this.showToast('Payment page', 'primary');
        break;
      case 'document':
        // this.router.navigate(['/document']);
        this.showToast('Document page', 'primary');
        break;
      case 'profile':
        // this.router.navigate(['/profile']);
        this.showToast('Profile page', 'primary');
        break;
    }
  }

  /**
   * Select property
   */
  async onSelectProperty() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Property',
      buttons: [
        {
          text: 'Skybreez',
          handler: () => {
            this.selectedProperty = 'Skybreez';
            // this.loadDocuments();
          }
        },
        {
          text: 'Sarasview',
          handler: () => {
            this.selectedProperty = 'Sarasview';
            // this.loadDocuments();
          }
        },
        {
          text: 'Green Valley',
          handler: () => {
            this.selectedProperty = 'Green Valley';
            // this.loadDocuments();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Get progress percentage
   */
  // getProgressPercentage(): number {
  //   return Math.round((this.currentSlab / this.totalSlabs) * 100);
  // }

  /**
   * Get remaining amount
   */
  // getRemainingAmount(): number {
  //   return this.totalCost - this.amountPaid;
  // }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  logout(){
    localStorage.removeItem('currentUser');
    this.router.navigateByUrl('login');
  }

}
