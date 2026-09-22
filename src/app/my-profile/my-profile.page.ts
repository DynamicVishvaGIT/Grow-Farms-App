import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ModalController, IonicSafeString } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { Api } from '../api';
import { User } from '../user';
import { Common } from '../common';

// Ticket interface
interface Ticket {
  id: number;
  category: string;
  status: string;
  statusClass: string;
  title: string;
  description: string;
  date: string;
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
  standalone: false,
})
export class MyProfilePage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  myTickets: any;
  dataLoaded:boolean = true;
  countData:any={in_process:0, pending:0, rejected:0 };
  // User Data
  userName: string = 'Gauresh Lotlikar';
  userEmail: string = 'gaureshlotlikar07@gmail.com';
  userMobile: string = '9876543210';

  // Tab Selection
  selectedTab: string = 'profile'; // 'profile' or 'tickets'

  // Ticket Stats
  verifiedTickets: number = 3;
  pendingTickets: number = 4;
  rejectedTickets: number = 0;

  myWithdrawal:any=[];
  userAccounts: any=[];

  // Tickets List
  tickets: Ticket[] = [
    {
      id: 1,
      category: 'Payment',
      status: 'In Progress',
      statusClass: 'in-progress',
      title: 'Payment confirmation delay',
      description: 'My payment was made 3 days ago but still shows as pending.',
      date: '16-09-2025'
    },
    {
      id: 1,
      category: 'Payment',
      status: 'In Progress',
      statusClass: 'in-progress',
      title: 'Payment confirmation delay',
      description: 'My payment was made 3 days ago but still shows as pending.',
      date: '16-09-2025'
    }
  ];

  // Add this property to your class variables alongside selectedTab
  // withdrawalList: any[] = [
  //   {
  //     property_name: 'SKYBREEZ',
  //     date: '18-09-2025',
  //     amount: '150,000',
  //     status: 'Pending Payment',
  //     statusClass: 'pending'
  //   },
  //   {
  //     property_name: 'ORCHID HEIGHTS',
  //     date: '10-09-2025',
  //     amount: '75,000',
  //     status: 'Approved',
  //     statusClass: 'approved'
  //   }
  // ];

  constructor(
    private router: Router, private alertController: AlertController, private toastController: ToastController, private modalController: ModalController,
    private apiService: Api, private userService: User, private commonService: Common
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // this.loadProfileData();
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
        if (event.url.includes('/my-profile')){ // Check if user navigated back to a specific URL
          this.load_support_ticket_details();
          this.get_user_accounts();
          if(this.currentUser.user_type=='Investor'){
            this.load_my_withdraw_requests();
          }
        }
    });
    // this.load_support_ticket_details();
  }

  doRefresh(event:any) {
    setTimeout(() => {
      this.load_support_ticket_details();
      event.target.complete();
    }, 2000);
  }

  ionViewWillEnter() {
    // Refresh data when view enters
    // this.loadProfileData();
  }

  load_support_ticket_details() {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    let ticketData:any={user_id:''};
    ticketData['user_id'] = this.currentUser.user_id;
    this.apiService.load_support_ticket_details(ticketData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myTickets = response.data;
      this.countData = response.counts;
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

  load_my_withdraw_requests() {
    // this.commonService.presentLoading();
    this.dataLoaded = false;
    this.apiService.load_my_withdraw_requests()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myWithdrawal = response.data;
      // this.dataLoaded = true;
      // this.commonService.dismissLoading();
    },
    respError => {
      // this.commonService.dismissLoading();
      this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  get_user_accounts() {
    let user: any={phone_number:''};
    user.phone_number = this.currentUser.phone_number;
    this.apiService.get_user_accounts(user)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.userAccounts = response.accounts;
    },
    respError => {
      // this.commonService.dismissLoading();
      this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  async onSwitchAccount() {
    const currentType = this.currentUser?.user_type;
    if (!currentType) {
      this.commonService.showToastMessage('Current account information not found','toast-error','',4000);
      return;
    }
    const nextType = currentType === 'Investor'? 'User': 'Investor';
    const message = new IonicSafeString(
      `Are you sure you want to switch from ` +
      `<strong>${currentType}</strong> account to ` +
      `<strong>${nextType}</strong> account?`
    );
    const alert = await this.alertController.create({
      header: 'Switch Account',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Switch',
          cssClass: 'switch-account-confirm-button',
          handler: () => {
            this.switchAccount();
          }
        }
      ]
    });
    await alert.present();
  }

  private switchAccount() {
    this.commonService.presentLoading();
    this.apiService.switch_account().pipe(
      takeUntil(this._unsubscribeAll)).subscribe({
        next: (response: any) => {
          console.log('Switch Account Response:', response);
          this.commonService.dismissLoading();
          if (!response || !response.status) {
            this.commonService.showToastMessage(response?.message || 'Unable to switch account','toast-error','',4000);
            return;
          }
          /** Create the same user object structure* that your existing login flow uses.*/
          const user = response.user_details || {};
          user.user_id = response.user_id;
          user.user_type = response.user_type;
          user.access_token = response.access_token;
          user.refresh_token = response.refresh_token;
          console.log('New Current User:', user);
          /** Update UserService.** This also updates localStorage because your* existing User.setCurrentUser() already does that.*/
          this.userService.setCurrentUser(user);
          /** Explicitly save currentUser as well.* This keeps the same behaviour as your existing* selectAccount() login flow.*/
          localStorage.setItem('currentUser',JSON.stringify(user));
          /** Determine dashboard from new account type.*/
          const dashboard = response.user_type === 'Investor'? '/investor-dashboard': '/home';
          /** Navigate to the new account dashboard.*/
          this.router.navigateByUrl(dashboard,{ replaceUrl: true }).then(() => {
            /** Full reload.** This ensures all dashboard components,* tabs, API data and account-specific state* are initialized again using the new token/user_type.*/
            window.location.reload();
          });
        },
        error: (error: any) => {
          console.error('Switch Account API Error:',error);
          this.commonService.dismissLoading();
          this.commonService.showToastMessage(error?.error?.message || error?.message || 'Unable to switch account. Please try again.','toast-error','',4000);
        }
      });
  }

  /**
   * Load profile data
   */
  private loadProfileData() {
    // TODO: Implement API call to fetch profile data
    console.log('Loading profile data...');

    // Simulate API response
    const profileData = {
      userName: 'Gauresh Lotlikar',
      userEmail: 'gaureshlotlikar07@gmail.com',
      userMobile: '9876543210',
      verifiedTickets: 3,
      pendingTickets: 4,
      rejectedTickets: 0
    };

    // Update component properties
    Object.assign(this, profileData);
  }

  /**
   * Switch between tabs
   */
  switchTab(tab: string) {
    this.selectedTab = tab;
    console.log('Switched to tab:', tab);
  }

  /**
   * Edit profile
   */
  async onEditProfile() {
    console.log('Edit profile clicked');
    // TODO: Navigate to edit profile page or open modal
    // this.router.navigate(['/edit-profile']);
    await this.showToast('Opening edit profile...', 'primary');
  }

  /**
   * Delete profile
   */
  async onDeleteProfile() {
    const alert = await this.alertController.create({
      header: 'Delete Profile',
      message: 'Are you sure you want to delete your profile? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Delete cancelled');
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.confirmDeleteProfile();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirm delete profile
   */
  private async confirmDeleteProfile() {
    // TODO: Implement API call to delete profile
    console.log('Deleting profile...');
    
    await this.showToast('Profile deleted successfully', 'success');
    
    // Navigate to login or home page
    // this.router.navigate(['/login']);
  }

  /**
   * Create new ticket
   */
  async onNewTicket() {
    console.log('New ticket clicked');
    
    const alert = await this.alertController.create({
      header: 'Create New Ticket',
      inputs: [
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category (e.g., Payment, Support)'
        },
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data) => {
            if (data.category && data.title && data.description) {
              this.createTicket(data);
              return true;
            } else {
              this.showToast('Please fill all fields', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Create ticket
   */
  private async createTicket(data: any) {
    // TODO: Implement API call to create ticket
    console.log('Creating ticket:', data);

    const newTicket: Ticket = {
      id: this.tickets.length + 1,
      category: data.category,
      status: 'In Progress',
      statusClass: 'in-progress',
      title: data.title,
      description: data.description,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-')
    };

    this.tickets.unshift(newTicket);
    this.pendingTickets++;

    await this.showToast('Ticket created successfully', 'success');
  }

  /**
   * Navigate to End User Login Page
   */
  navigateToNewTicket() {
    console.log('Navigating to End User Login');
    this.router.navigate(['/add-support-ticket']);
  }

  /**
   * View ticket details
   */
  // viewTicket(ticket: Ticket) {
  //   console.log('View ticket:', ticket);
  //   // TODO: Navigate to ticket details page or open modal
  //   this.showToast(`Viewing ticket #${ticket.id}`, 'primary');
  // }

  /**
   * Navigate to different tabs
   */
  navigateTo(tab: string) {
    console.log('Navigating to:', tab);
    // TODO: Implement navigation logic
    
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
        // this.router.navigate(['/payment']);
        this.showToast('Payment page', 'primary');
        break;
      case 'document':
        // this.router.navigate(['/document']);
        this.showToast('Document page', 'primary');
        break;
      case 'profile':
        // Already on profile page
        break;
    }
  }

  /**
   * Get total tickets
   */
  getTotalTickets(): number {
    return this.verifiedTickets + this.pendingTickets + this.rejectedTickets;
  }

  viewTicket(ticket:any) {
    this.router.navigate(['/ticket-details', ticket.id]);
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phone: string): string {
    // Format: 9876543210 -> (987) 654-3210
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
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
   * Logout user
   */
  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            this.confirmLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirm logout
   */
  private async confirmLogout() {
    this.userService.clearCurrentUser();  // 🔥 important
    localStorage.removeItem('currentUser');
    this.router.navigateByUrl('login-by-type');
  }

   async delete_dialog() {
    const confirm = await this.alertController.create({
      // header: this.sold_unsold_text=='Mark as Sold'?'Mark as Sold':'Mark as Unsold',
      header: 'Delete My Account',
      message: 'Do you want delete your account.?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Ok, Delete it',
          handler: () => {
            // this.delete_user_account();
          }
        }
      ]
    });
   await  confirm.present();
  }
   

  delete_user_account() {
    // let formData = new FormData();
    // formData.append("user_id",this.currentUser.user_id);
    // formData.append("apptype",'mobile')
    // this.apiService.delete_user(formData)
    // .pipe(takeUntil(this._unsubscribeAll))
    // .subscribe((response:any) => {
    //   console.log('delete_user',response);
    //   this.commonService.showToastMessage(response.message, 'error-toast','', 4000);
    //   this.logoutMyDevice();
    // },
    // respError => {
    //   this.addAdvantage = true;
    //   this.commonService.showToastMessage(respError, 'error-toast','', 2000);
    // })
  }
  

}
