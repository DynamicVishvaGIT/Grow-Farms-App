
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { Api } from '../api';
import { Common } from '../common';
import { User } from '../user';

// Interfaces
interface PersonalInfo {
  fullName: string;
  dob: string;
  profession: string;
  pan: string;
  email: string;
  phone: string;
}

interface Address {
  fullAddress: string;
  landmark: string;
}

interface LandDetails {
  project: string;
  gatNo: string;
  area: string;
  landmark: string;
}

interface Document {
  id: string;
  title: string;
  uploadDate: string;
  status: string;
  statusClass: string;
  fileUrl?: string;
}


@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.page.html',
  styleUrls: ['./booking-details.page.scss'],
  standalone: false,
})
export class BookingDetailsPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  booking_id='';
  property_id = '';
  myPersonalDetails:any;
  myDoc:any;
  paymentSlabs:any;
  dataLoaded:boolean = true;


  // Tab Selection
  selectedTab: string = 'details';

  constructor(
    private route: ActivatedRoute, private router: Router, private toastController: ToastController,private alertController: AlertController,
    private apiService: Api, private commonService: Common, private userService: User
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // this.loadBookingDetails();
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
    const id = this.route.snapshot.paramMap.get('booking_id');
    const property_id = this.route.snapshot.paramMap.get('property_id');
    if (id) {
      this.booking_id = id;
    }
    if (property_id) {
      this.property_id = property_id;
    }
    console.log(this.booking_id);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url.includes('/booking-details')){ // Check if user navigated back to a specific URL
          this.view_user_details_and_booking_details();
        }
    });
    // this.loadBookings();
    // this.view_user_details_and_booking_details();
  }

  doRefresh(event:any) {
    setTimeout(() => {
      this.view_user_details_and_booking_details();
      event.target.complete();
    }, 2000);
  }

  view_user_details_and_booking_details() {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    let bookingData:any={booking_id:''};
    bookingData['user_id'] = this.currentUser.user_id;
    bookingData['booking_id'] = this.booking_id;
    bookingData['property_id'] = this.property_id;
    this.apiService.view_user_details_and_booking_details(bookingData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myPersonalDetails = response.details;
      this.myDoc = response.documents;
      this.paymentSlabs = response.installments;
      // this.totalBookings = response.total_bookings;
      // this.selectedFilter = category_name;
      // this.filteredDocuments = [...this.myDocuments];
      // this.dataLoaded = true;
      this.commonService.dismissLoading();
    },
    respError => {
      this.commonService.dismissLoading();
      this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  /**
   * Load booking details
   */
  private loadBookingDetails() {
    // Get booking ID from route params if available
    const bookingId = this.route.snapshot.paramMap.get('id');
    
    if (bookingId) {
      // TODO: Implement API call to fetch booking details
      console.log('Loading booking details for ID:', bookingId);
      this.fetchBookingData(bookingId);
    } else {
      // Use mock data
      console.log('Using mock booking data');
    }
  }

  /**
   * Fetch booking data from API
   */
  private async fetchBookingData(bookingId: string) {
    // TODO: Implement actual API call
    // For now, using mock data
    console.log('Fetching booking data for:', bookingId);

    // Simulate API response
    const bookingData = {
      bookingRef: 'GF-20240115-001',
      status: 'Document Verification',
      statusClass: 'verification',
      personalInfo: {
        fullName: 'Mr. Gauresh Lotlikar',
        dob: '15/5/1990',
        profession: 'Service',
        pan: 'ABCDE1234F',
        email: 'gauresh@example.com',
        phone: '+91 9876543210'
      },
      address: {
        fullAddress: 'Flat 101, Green Apartments, Koregaon Park\nPune - 411001',
        landmark: 'Near Osho Garden'
      },
      landDetails: {
        project: 'Skybreez',
        gatNo: 'GT-45/2',
        area: '20,000 sq.ft',
        landmark: 'Near Main Road'
      }
    };

    // Update component properties
    Object.assign(this, bookingData);
  }

  /**
   * Switch between tabs
   */
  switchTab(tab: string) {
    this.selectedTab = tab;
    console.log('Switched to tab:', tab);
    this.view_user_details_and_booking_details();
  }

  /**
   * Download booking details
   */
  async onDownload() {
    console.log('Download clicked');
    
    const alert = await this.alertController.create({
      header: 'Download Options',
      message: 'Choose download format',
      buttons: [
        {
          text: 'PDF',
          handler: () => {
            this.downloadAsPDF();
          }
        },
        {
          text: 'Excel',
          handler: () => {
            this.downloadAsExcel();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Download as PDF
   */
  private async downloadAsPDF() {
    // TODO: Implement PDF download
    console.log('Downloading as PDF...');
    await this.showToast('Downloading PDF...', 'primary');
    
    // Simulate download
    setTimeout(async () => {
      await this.showToast('PDF downloaded successfully', 'success');
    }, 1500);
  }

  /**
   * Download as Excel
   */
  private async downloadAsExcel() {
    // TODO: Implement Excel download
    console.log('Downloading as Excel...');
    await this.showToast('Downloading Excel...', 'primary');
    
    // Simulate download
    setTimeout(async () => {
      await this.showToast('Excel downloaded successfully', 'success');
    }, 1500);
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as +91 XXXXXXXXXX
    if (cleaned.length === 10) {
      return `+91 ${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    }
    
    return phone;
  }

  /**
   * Edit booking details
   */
  async editBooking() {
    console.log('Edit booking');
    // TODO: Navigate to edit page or open modal
    await this.showToast('Edit functionality coming soon', 'primary');
  }

  /**
   * Share booking details
   */
  async shareBooking() {
    console.log('Share booking');
    
    const alert = await this.alertController.create({
      header: 'Share Booking Details',
      message: 'Share via:',
      buttons: [
        {
          text: 'Email',
          handler: () => {
            this.shareViaEmail();
          }
        },
        {
          text: 'WhatsApp',
          handler: () => {
            this.shareViaWhatsApp();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Share via Email
   */
  private async shareViaEmail() {
    console.log('Sharing via email...');
    await this.showToast('Opening email client...', 'primary');
  }

  /**
   * Share via WhatsApp
   */
  private async shareViaWhatsApp() {
    console.log('Sharing via WhatsApp...');
    await this.showToast('Opening WhatsApp...', 'primary');
  }

  /**
   * View document details
   */
  async viewDocument(document: Document) {
    console.log('View document:', document);
    
    const alert = await this.alertController.create({
      header: document.title,
      message: `Status: ${document.status}\nUploaded: ${document.uploadDate}`,
      buttons: [
        {
          text: 'Download',
          handler: () => {
            this.downloadDocument(document);
          }
        },
        {
          text: 'View',
          handler: () => {
            this.openDocument(document);
          }
        },
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Download document
   */
  private async downloadDocument(document: Document) {
    console.log('Downloading document:', document.title);
    await this.showToast(`Downloading ${document.title}...`, 'primary');
    
    // TODO: Implement actual download
    setTimeout(async () => {
      await this.showToast('Document downloaded successfully', 'success');
    }, 1500);
  }

  /**
   * Open document
   */
  private async openDocument(document: Document) {
    console.log('Opening document:', document.title);
    // TODO: Implement document viewer or open in browser
    await this.showToast(`Opening ${document.title}...`, 'primary');
  }

  /**
   * Go back to previous page
   */
  goBack() {
    this.router.navigate(['/my-bookings']);
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
