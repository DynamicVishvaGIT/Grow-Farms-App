import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { Api } from '../api';
import { Common } from '../common';
import { User } from '../user';


@Component({
  selector: 'app-payment-slabs',
  templateUrl: './payment-slabs.page.html',
  styleUrls: ['./payment-slabs.page.scss'],
  standalone: false,
})
export class PaymentSlabsPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  properties:any=[];

  // Header data
  notificationCount: number = 1;
  selectedProperty: string = '';
  property_id: string='';
  dataLoaded:boolean = true;
  myPaymentSlabs:any=[];
  summaryData: any;

  // Filter
  selectedFilter: string = 'All';
  filteredSlabs: any=[];

  constructor(
    private router: Router,private alertController: AlertController,private toastController: ToastController,private actionSheetController: ActionSheetController,
    private apiService: Api, private commonService: Common, private userService: User
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // this.loadPaymentSlabs();
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
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url.includes('/payment-slabs')){ // Check if user navigated back to a specific URL
          this.load_dashboard_property();
        }
    });
    // this.load_property();
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
      this.property_id = response.data[0].property_id;
      this.get_payment_slabs('All');
    },
    respError => {
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  /*** Select property*/
  async selectProperty() {
    const buttons = this.properties.map((property:any) => ({
      text: property.property_name,
      handler: () => {
        this.selectedProperty = property.property_name;
        this.property_id = property.property_id;
        this.get_payment_slabs(this.selectedFilter);
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

  get_payment_slabs(payment_status:string) {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    let paymentData:any={login_user_id:'',payment_status:'', property_id:''};
    paymentData['login_user_id'] = this.currentUser.user_id;
    paymentData['payment_status'] = payment_status;
    paymentData['property_id'] = this.property_id;
    this.apiService.get_payment_slabs(paymentData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myPaymentSlabs = response.data;
      // this.totalBookings = response.total_bookings;
      this.selectedFilter = payment_status;
      this.filteredSlabs = [...this.myPaymentSlabs];
      this.summaryData = response.summary;
      this.dataLoaded = true;
      this.commonService.dismissLoading();
    },
    respError => {
      this.commonService.dismissLoading();
      this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  ionViewWillEnter() {
    // Refresh data when view enters
    // this.loadPaymentSlabs();
  }
  /**
   * Handle notification icon click
   */
  async onNotificationClick() {
    console.log('Notification clicked');
    await this.showToast('Opening notifications...', 'primary');
  }

  

  goToMakePayment() {
    this.router.navigate(['/make-payment-receipt', this.property_id]);
  }

  /**
   * Mark payment
   */
  // async onMarkPayment() {
  //   // Get pending slabs
  //   const pendingSlabs = this.slabs.filter(s => s.statusClass === 'pending');

  //   if (pendingSlabs.length === 0) {
  //     await this.showToast('No pending payments', 'warning');
  //     return;
  //   }

  //   // Show alert to select slab
  //   const buttons = pendingSlabs.map(slab => ({
  //     text: `${slab.title} - ₹${slab.amount.toLocaleString('en-IN')}`,
  //     handler: () => {
  //       this.confirmPayment(slab);
  //     }
  //   }));

  //   buttons.push({
  //     text: 'Cancel',
  //     handler: () => {}
  //   });

  //   const alert = await this.alertController.create({
  //     header: 'Select Payment Slab',
  //     buttons: buttons
  //   });

  //   await alert.present();
  // }

  /**
   * Confirm payment
   */
  // private async confirmPayment(slab: PaymentSlab) {
  //   const alert = await this.alertController.create({
  //     header: 'Confirm Payment',
  //     message: `Mark ${slab.title} (₹${slab.amount.toLocaleString('en-IN')}) as paid?`,
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel'
  //       },
  //       {
  //         text: 'Confirm',
  //         handler: () => {
  //           this.processPayment(slab);
  //         }
  //       }
  //     ]
  //   });

  //   await alert.present();
  // }

  /**
   * Process payment
   */
  // private async processPayment(slab: PaymentSlab) {
  //   // TODO: Implement API call to mark payment
  //   console.log('Processing payment for:', slab);

  //   await this.showToast('Processing payment...', 'primary');

  //   // Simulate payment processing
  //   setTimeout(() => {
  //     // Update slab status
  //     slab.status = 'Paid';
  //     slab.statusClass = 'paid';
  //     slab.iconName = 'checkmark';
  //     slab.paidDate = new Date().toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: '2-digit',
  //       year: 'numeric'
  //     }).replace(/\//g, '-');

  //     // Recalculate stats
  //     this.calculateStats();

  //     // Reapply filter
  //     this.filterSlabs(this.selectedFilter);

  //     this.showToast('Payment marked successfully!', 'success');
  //   }, 1500);
  // }

  /**
   * View slab details
   */
  viewSlabDetails(slab: any) {
    console.log('View slab details:', slab);
    // TODO: Navigate to slab details page or open modal
    this.showToast(`Viewing ${slab.title} details`, 'primary');
  }

  /**
   * Navigate to different tabs
   */
  navigateTo(tab: string) {
    console.log('Navigating to:', tab);
    
    switch (tab) {
      case 'dashboard':
        // this.router.navigate(['/dashboard']);
        this.showToast('Dashboard page', 'primary');
        break;
      case 'booking':
        // this.router.navigate(['/booking']);
        this.showToast('Booking page', 'primary');
        break;
      case 'payment':
        // Already on payment page
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
   * Get total payment amount
   */
  // getTotalAmount(): number {
  //   return this.slabs.reduce((sum, slab) => sum + slab.amount, 0);
  // }

  /**
   * Get paid amount
   */
  // getPaidAmount(): number {
  //   return this.slabs
  //     .filter(s => s.statusClass === 'paid')
  //     .reduce((sum, slab) => sum + slab.amount, 0);
  // }

  /**
   * Get pending amount
   */
  // getPendingAmount(): number {
  //   return this.slabs
  //     .filter(s => s.statusClass === 'pending')
  //     .reduce((sum, slab) => sum + slab.amount, 0);
  // }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  goToPaymentReceipt() {
    this.router.navigate(['/payment-receipt']);
    // this.router.navigate(['/payment-receipt']);
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

}
