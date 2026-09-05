import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { ActionSheetController, AlertController, IonTabs, LoadingController, MenuController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { User } from './user';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  public selectedIndex = 0;
  selectedPath = '';
  selected:boolean = false;
  public appPages = [
    {
      title: 'Dashboard',
      url: '/home',
      icon: 'home-outline'
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: 'person-outline'
    }
  ];
  @ViewChild('myTabs',{ static: false }) tabs!: IonTabs;
  selectedTab: string = '';
  activeTabName: any;
  tab_name: any;
  userstatus_data: any;
  userstatus: any;
  loginStatus: boolean = false;
  displayProfileData = {first_name: '', last_name: '', email: '', avatar: ''};
  app_data:any;
  verified_data:any;
  device_type:string='';

  constructor(private platform: Platform,private statusBar: StatusBar, private router: Router, private modalCtrl: ModalController,private location: Location, 
    private userService: User, private alertController: AlertController, private actionSheetController: ActionSheetController, private popoverController: PopoverController,
  private loadingController: LoadingController, private menuCtrl: MenuController) {
      this.initializeApp();
      this.platform.backButton.subscribeWithPriority(9999, async () => {

        const modal = await this.modalCtrl.getTop();  // 👈 check if a modal is open
        if (modal) {
          await modal.dismiss();   // close modal instead of navigating
          return;
        }
        const alert = await this.alertController.getTop();
        if (alert) {
          await alert.dismiss();
          return;
        }
        const actionSheet = await this.actionSheetController.getTop();
        if (actionSheet) {
          await actionSheet.dismiss();
          return;
        }
        const popover = await this.popoverController.getTop();
        if (popover) {
          await popover.dismiss();
          return;
        }
        const loading = await this.loadingController.getTop();
        if (loading) {
          await loading.dismiss();
          return;
        }
        const currentUrl = this.router.url;
        if (currentUrl === '/home' || currentUrl === '/login') {
          // Exit app on back press from these pages
          (navigator as any).app.exitApp();
        } 
        else if (currentUrl === '/my-profile' || currentUrl === '/my-bookings' || currentUrl === '/payment-slabs' || currentUrl === '/document-list') {
          // Navigate back to home or previous logic
          this.router.navigateByUrl('/home');
        } 
        else if (currentUrl === '/login-by-type' || currentUrl === '/verify-otp' || currentUrl === '/booking-details' || currentUrl === '/payment-receipt' || currentUrl.includes('/make-payment-receipt') || currentUrl.includes('/notifications')) {
          // Go back to the previous page
          this.location.back();
        } 
        else {
          // Default behavior
          this.location.back();
        }
      });
    }

    ngOnInit() {
      this.checkLoginStatus();
      this.menuCtrl.enable(false);
      this.selectedPath = window.location.pathname;
      const path = window.location.pathname.split('folder/')[1];
      if (path !== undefined) {
        this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
      }
    }

    async checkLoginStatus(){
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('118',currentUser);
      // this.displayProfileData.full_name = currentUser.full_name;
      // this.displayProfileData.email_id = currentUser.email_id;
      if (Object.keys(currentUser).length != 0) {
        this.userService.setCurrentUser(currentUser);  // Update via UserService
        this.router.navigateByUrl('/home');  // Navigate to home page after login
      } else {
        this.router.navigate(['/login']);
      }
    }

    initializeApp() {
      // this.platform.ready().then(() => {
      //   // StatusBar configuration for Cordova
      //   this.statusBar.styleDefault();
      //   this.statusBar.backgroundColorByHexString('#F4F6F8');
      //   this.statusBar.overlaysWebView(false); // This is KEY - prevents overlay
      // });
      this.platform.ready().then(() => {
        if (this.platform.is('android')) {
          // Works for Android 12 and below
          this.statusBar.overlaysWebView(false);
          this.statusBar.backgroundColorByHexString('#ffffff');
          this.statusBar.styleDefault(); // Dark icons on light background
          
          // Additional fix for Android 13+ 
          // This setTimeout doesn't break older versions, it just ensures the settings apply
          setTimeout(() => {
            this.statusBar.overlaysWebView(false);
            this.statusBar.backgroundColorByHexString('#ffffff');
            this.statusBar.show();
          }, 100);
          
        } else if (this.platform.is('ios')) {
          this.statusBar.styleDefault();
          this.statusBar.overlaysWebView(false);
        }
      });
      // this.platform.ready().then(() => {
      //   // Disable overlay
      //   this.statusBar.overlaysWebView(true);
  
      //   // Small delay helps on Android 13+
      //   setTimeout(() => {
      //     // Set background color again after rendering
      //     this.statusBar.backgroundColorByHexString('#F4F6F8');
  
      //     // Use dark icons for light background
      //     this.statusBar.styleDefault();
      //   }, 300);
      // });
    }

    getSelectedTab(): void {
      this.selected = true;
      this.activeTabName = this.tabs.getSelected();
      this.tab_name=this.activeTabName
    }
    openPage(page:any) {
      this.selectedPath = page.url;
     this.router.navigate([page.url])
    }

    
}
