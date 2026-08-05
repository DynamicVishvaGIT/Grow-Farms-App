import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { Api } from '../api';
import { Common } from '../common';
import { User } from '../user';
import { filter, Subject, takeUntil } from 'rxjs';

// Payment Receipt interface
interface PaymentReceipt {
  id: number;
  title: string;
  status: string;
  statusClass: string;
  transactionId: string;
  amount: number;
  transferDate: string;
  receiptUrl?: string;
}


@Component({
  selector: 'app-payment-receipt',
  templateUrl: './payment-receipt.page.html',
  styleUrls: ['./payment-receipt.page.scss'],
  standalone: false,
})
export class PaymentReceiptPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  payment_slab_id:string='';
  dataLoaded:boolean = true;
  properties:any=[];
  property_id:string='';
  myPaymentReceipt: any=[];
  countData:any;
  filteredReceipts:any=[];

  // Header data
  notificationCount: number = 1;
  selectedProperty: string = '';

  // Filter
  selectedFilter: string = 'all';

  // Stats
  verifiedCount: number = 3;
  pendingCount: number = 4;
  rejectedCount: number = 0;

  // Payment Receipts
  receipts: PaymentReceipt[] = [
    {
      id: 1,
      title: 'Slab 1',
      status: 'Verified',
      statusClass: 'verified',
      transactionId: 'TXN123456789',
      amount: 500000,
      transferDate: '16-09-2025'
    },
    {
      id: 2,
      title: 'Slab 2',
      status: 'Verified',
      statusClass: 'verified',
      transactionId: 'TXN123456789',
      amount: 500000,
      transferDate: '16-09-2025'
    },
    {
      id: 3,
      title: 'Slab 3',
      status: 'Verified',
      statusClass: 'verified',
      transactionId: 'TXN123456789',
      amount: 500000,
      transferDate: '16-09-2025'
    },
    {
      id: 4,
      title: 'Slab 4',
      status: 'Pending',
      statusClass: 'pending',
      transactionId: 'TXN987654321',
      amount: 450000,
      transferDate: '15-09-2025'
    },
    {
      id: 5,
      title: 'Slab 5',
      status: 'Pending',
      statusClass: 'pending',
      transactionId: 'TXN456789123',
      amount: 550000,
      transferDate: '14-09-2025'
    },
    {
      id: 6,
      title: 'Slab 6',
      status: 'Pending',
      statusClass: 'pending',
      transactionId: 'TXN789123456',
      amount: 450000,
      transferDate: '13-09-2025'
    },
    {
      id: 7,
      title: 'Slab 7',
      status: 'Pending',
      statusClass: 'pending',
      transactionId: 'TXN321654987',
      amount: 500000,
      transferDate: '12-09-2025'
    }
  ];

  // filteredReceipts: PaymentReceipt[] = [];

  constructor(
    private route: ActivatedRoute, private router: Router,private alertController: AlertController,private toastController: ToastController,private actionSheetController: ActionSheetController,
    private apiService: Api, private commonService: Common, private userService: User
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadReceipts();
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
    // const payment_slab_id = this.route.snapshot.paramMap.get('payment_slab_id');
    // const property_id = this.route.snapshot.paramMap.get('property_id');
    // if (payment_slab_id) {
    //   this.payment_slab_id = payment_slab_id;
    // }
    // if(property_id){
    //   this.property_id = property_id;
    // }
    // console.log(this.payment_slab_id);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url.includes('/payment-receipt')){ // Check if user navigated back to a specific URL
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
      this.view_payment_receipts('all');
      // let index = this.commonService.findItem(this.properties,'property_id',this.property_id);
      // if(index!=-1){
      //   this.selectedProperty = this.properties[index].property_name;
      //   this.property_id = response.data[index].property_id;
      //   this.view_payment_receipts('all');
      // }
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
        this.view_payment_receipts(this.selectedFilter);
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

  view_payment_receipts(payment_status:string) {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    let paymentData:any={user_id:'',payment_slab_id:'',payment_status:'', property_id:''};
    paymentData['user_id'] = this.currentUser.user_id;
    // paymentData['payment_slab_id'] = this.payment_slab_id;
    // paymentData['payment_slab_id'] = '4';
    paymentData['payment_status'] = payment_status;
    paymentData['property_id'] = this.property_id;
    this.apiService.view_payment_receipts(paymentData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myPaymentReceipt = response.data;
      // this.totalBookings = response.total_bookings;
      this.selectedFilter = payment_status;
      this.filteredReceipts = [...this.myPaymentReceipt];
      this.countData = response.counts;
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
    this.loadReceipts();
  }

  /**
   * Load payment receipts data
   */
  private loadReceipts() {
    // TODO: Implement API call to fetch payment receipts
    console.log('Loading payment receipts...');

    // Calculate stats
    this.calculateStats();

    // Apply initial filter
    this.filterReceipts(this.selectedFilter);
  }

  /**
   * Calculate receipt statistics
   */
  private calculateStats() {
    this.verifiedCount = this.receipts.filter(r => r.statusClass === 'verified').length;
    this.pendingCount = this.receipts.filter(r => r.statusClass === 'pending').length;
    this.rejectedCount = this.receipts.filter(r => r.statusClass === 'rejected').length;
  }

  /**
   * Filter receipts based on status
   */
  filterReceipts(filter: string) {
    this.selectedFilter = filter;

    switch (filter) {
      case 'all':
        this.filteredReceipts = [...this.receipts];
        break;
      case 'verified':
        this.filteredReceipts = this.receipts.filter(r => r.statusClass === 'verified');
        break;
      case 'pending':
        this.filteredReceipts = this.receipts.filter(r => r.statusClass === 'pending');
        break;
      case 'rejected':
        this.filteredReceipts = this.receipts.filter(r => r.statusClass === 'rejected');
        break;
      default:
        this.filteredReceipts = [...this.receipts];
    }

    console.log('Filtered receipts:', this.filteredReceipts);
  }

  /**
   * Handle notification icon click
   */
  async onNotificationClick() {
    console.log('Notification clicked');
    await this.showToast('Opening notifications...', 'primary');
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
            this.loadReceipts();
          }
        },
        {
          text: 'Sarasview',
          handler: () => {
            this.selectedProperty = 'Sarasview';
            this.loadReceipts();
          }
        },
        {
          text: 'Green Valley',
          handler: () => {
            this.selectedProperty = 'Green Valley';
            this.loadReceipts();
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
   * Download receipt
   */
  async downloadReceipt(receipt: PaymentReceipt) {
    console.log('Downloading receipt:', receipt);
    
    await this.showToast(`Downloading ${receipt.title} receipt...`, 'primary');

    // TODO: Implement actual download logic
    setTimeout(async () => {
      await this.showToast('Receipt downloaded successfully!', 'success');
    }, 1500);
  }

  /**
   * View receipt
   */
  async viewReceipt(receipt: PaymentReceipt) {
    console.log('Viewing receipt:', receipt);
    
    await this.showToast(`Opening ${receipt.title} receipt...`, 'primary');

    // TODO: Implement receipt viewer or open in browser
    // For example: this.router.navigate(['/receipt-viewer', receipt.id]);
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
   * Get total amount from all receipts
   */
  getTotalAmount(): number {
    return this.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  }

  /**
   * Get verified amount
   */
  getVerifiedAmount(): number {
    return this.receipts
      .filter(r => r.statusClass === 'verified')
      .reduce((sum, receipt) => sum + receipt.amount, 0);
  }

  /**
   * Get pending amount
   */
  getPendingAmount(): number {
    return this.receipts
      .filter(r => r.statusClass === 'pending')
      .reduce((sum, receipt) => sum + receipt.amount, 0);
  }

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

}
