import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { Common } from '../common';
import { Api } from '../api';
import { User } from '../user';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.page.html',
  styleUrls: ['./my-bookings.page.scss'],
  standalone: false,
})
export class MyBookingsPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  myBookings:any = [];
  currentUser:any;
  // Page data
  totalBookings: number = 0;
  notificationCount: number = 1;

  // Search
  searchQuery: string = '';
  // Filter
  selectedFilter: string = 'all';
  filteredBookings:any = [];
  dataLoaded:boolean = true;

constructor(
  private router: Router,
  private alertController: AlertController,
  private toastController: ToastController,
  private modalController: ModalController,
  private commonService: Common, private apiService: Api,private userService: User
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
  this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
    ).subscribe((event: NavigationEnd) => {
      if (event.url.includes('/my-bookings')){ // Check if user navigated back to a specific URL
        this.load_my_booking('all');
      }
  });
  // this.load_my_booking('all');
}

doRefresh(event:any) {
  setTimeout(() => {
    this.load_my_booking('all');
    event.target.complete();
  }, 2000);
}

// ionViewWillEnter() {
//   // Refresh bookings when view enters
//   // this.loadBookings();
//   this.load_booking();
// }

load_my_booking(booking_status:string) {
  this.commonService.presentLoading();
  this.dataLoaded = false;
  // let bookingData:any={login_user_id:'',booking_status:''};
  let bookingData:any={booking_status:''};
  // bookingData['login_user_id'] = this.currentUser.user_id;
  bookingData['booking_status'] = booking_status;
  this.apiService.load_my_booking(bookingData)
  .pipe(takeUntil(this._unsubscribeAll))
  .subscribe((response:any) => {
    console.log(response);
    this.myBookings = response.data;
    if(booking_status=='all'){
      this.totalBookings = response.total_bookings;
    }
    this.selectedFilter = booking_status;
    this.filteredBookings = [...this.myBookings];
    this.dataLoaded = true;
    this.commonService.dismissLoading();
  },
  respError => {
    this.commonService.dismissLoading();
    this.dataLoaded = false;
    this.commonService.showToastMessage(respError, 'toast-error','', 4000);
  })
}

getStatusClass(status: string) {
  switch (status) {
    case 'Pending Payment':
      return 'pending';
    case 'Confirmed':
      return 'Confirmed';
    default:
      return '';
  }
}

/**
   * Handle search input
   */
onSearch() {
  this.applyFilters();
}

 /**
   * Apply both search and category filters
   */
 private applyFilters() {
  let results = [...this.myBookings];

  // Apply search filter
  if (this.searchQuery && this.searchQuery.trim() !== '') {
    const query = this.searchQuery.toLowerCase().trim();
    results = results.filter(booking => 
      booking.project_name.toLowerCase().includes(query) ||
      booking.reference_code.toLowerCase().includes(query) ||
      booking.survey_no.toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  }

  this.filteredBookings = results;
  console.log('Filtered bookings:', this.filteredBookings);
}

/**
 * Handle notification icon click
 */
async onNotificationClick() {
  console.log('Notification clicked');
  // TODO: Navigate to notifications page
  await this.showToast('Opening notifications...', 'primary');
}

/**
 * View booking details
 */
async viewBooking(booking: any) {
  // console.log('View booking:', booking);
  // TODO: Navigate to booking details page or open modal
  this.router.navigate(['/booking-details', booking.booking_id, booking.property_id]);
  // this.router.navigate(['/booking-details']);
  // await this.showToast(`Viewing ${booking.propertyName}`, 'primary');
}

/**
 * Message about booking
 */
async messageBooking(booking: any) {
  console.log('Message booking:', booking);
  // TODO: Open message/chat interface
  await this.showToast(`Opening chat for ${booking.propertyName}`, 'primary');
}

/**
 * Schedule booking visit or meeting
 */
async scheduleBooking(booking: any) {
  console.log('Schedule booking:', booking);
  
  const alert = await this.alertController.create({
    header: 'Schedule Visit',
    message: `Schedule a visit for ${booking.propertyName}?`,
    inputs: [
      {
        name: 'date',
        type: 'date',
        placeholder: 'Select Date'
      },
      {
        name: 'time',
        type: 'time',
        placeholder: 'Select Time'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Schedule',
        handler: (data) => {
          if (data.date && data.time) {
            this.confirmSchedule(booking, data.date, data.time);
          } else {
            this.showToast('Please select date and time', 'warning');
          }
        }
      }
    ]
  });

  await alert.present();
}

/**
 * Confirm schedule
 */
private async confirmSchedule(booking: any, date: string, time: string) {
  // TODO: Implement API call to schedule visit
  console.log('Scheduling visit:', { booking, date, time });
  await this.showToast('Visit scheduled successfully!', 'success');
}

/**
 * Get remaining payment amount
 */
getRemainingAmount(booking: any): number {
  return booking.totalAmount - booking.paidAmount;
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

/**
 * Submit withdrawal request
 */
async withdrawalRequest(booking_id: string) {
  console.log('Withdrawal request for:', booking_id);
  this.router.navigate(['/withdrawal-request', booking_id]);
  // const alert = await this.alertController.create({
  //   header: 'Withdrawal Request',
  //   message: `Submit a withdrawal request for ${booking.property_name}?`,
  //   buttons: [
  //     { text: 'Cancel', role: 'cancel' },
  //     {
  //       text: 'Submit',
  //       handler: () => {
  //         // TODO: call API to submit withdrawal request
  //         this.showToast('Withdrawal request submitted!', 'success');
  //       }
  //     }
  //   ]
  // });

  // await alert.present();
}


}
