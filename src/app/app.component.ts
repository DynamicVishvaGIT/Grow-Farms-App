import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { ActionSheetController, AlertController, IonTabs, LoadingController, MenuController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { User } from './user';
import { Subject, takeUntil } from 'rxjs';
import { Api } from './api';
import { Common } from './common';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  private _unsubscribeAll: Subject<any>;

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
  currentUser:any;
  selectedTabLabel: string = 'Booking';
  dashboardTab: string = 'home';
  

  constructor(private platform: Platform,private statusBar: StatusBar, private router: Router, private modalCtrl: ModalController,private location: Location, 
    private userService: User, private alertController: AlertController, private actionSheetController: ActionSheetController, private popoverController: PopoverController,
  private loadingController: LoadingController, private menuCtrl: MenuController, private apiService: Api, private commonService: Common, private appVersion: AppVersion,
  private inAppBrowser: InAppBrowser, private alertCtrl: AlertController) {
    this._unsubscribeAll = new Subject();
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
        if (currentUrl === '/home' || currentUrl === '/login' || currentUrl === '/investor-dashboard') {
          // Exit app on back press from these pages
          (navigator as any).app.exitApp();
        } 
        else if (currentUrl === '/my-profile' || currentUrl === '/my-bookings' || currentUrl === '/payment-slabs' || currentUrl === '/document-list') {
          // Navigate back to home or previous logic
          this.router.navigateByUrl('/home');
        } 
        else if (currentUrl === '/withdrawal-request') {
          // Navigate back to home or previous logic
          this.router.navigateByUrl('/my-bookings');
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

    // async checkLoginStatus(){
    //   this.userService.currentUser$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe(user => {
    //     if (user) {
    //       this.currentUser = user;
    //       console.log('39', this.currentUser);
    //     } 
    //     else {
    //       const storedUser = localStorage.getItem('currentUser');
    //       if (storedUser) {
    //         this.currentUser = JSON.parse(storedUser);
    //         console.log('44', this.currentUser);
    //       }
    //     }
    // });
    //   // this.displayProfileData.full_name = currentUser.full_name;
    //   // this.displayProfileData.email_id = currentUser.email_id;
    //   if (Object.keys(this.currentUser).length != 0) {
    //     this.userService.setCurrentUser(this.currentUser);  // Update via UserService
    //     if(this.currentUser.user_type=='User'){
    //       this.router.navigateByUrl('/home');  // Navigate to home page after login
    //     }
    //     else{
    //       this.router.navigateByUrl('/investor-dashboard');  // Navigate to home page after login
    //     }
    //   } else {
    //     this.router.navigate(['/login-by-type']);
    //   }
    // }

    async checkLoginStatus() {
      this.userService.currentUser$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(user => {
          if (user) {
            this.currentUser = user;
          } else {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              this.currentUser = JSON.parse(storedUser);
            }
          }
          console.log('Current User:', this.currentUser);
          if (!this.currentUser || Object.keys(this.currentUser).length === 0) {
            this.router.navigate(['/login-by-type']);
            return;
          }
          // Set dashboard route according to user type
          if (this.currentUser.user_type === 'Investor') {
            this.dashboardTab = 'investor-dashboard';
            this.selectedTabLabel = 'Investments';
            this.router.navigateByUrl('/investor-dashboard');
          } else {
            this.dashboardTab = 'home';
            this.selectedTabLabel = 'Booking';
            this.router.navigateByUrl('/home');
          }
        });
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
      if (this.platform.is(this.apiService.device_type as 'android' | 'ios')) {
        this.checkAppVersion();
      }
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

    checkAppVersion() {
      this.apiService.app_update().subscribe({
        next: (res: any) => {
          console.log('app_update', res);
          this.app_data = res[0];
          this.handleVersionCheck();
          // this.versionAlert(this.app_data);
        },
        error: (error) => {
          console.log(error);
          this.commonService.dismissLoading();
          this.commonService.showToastMessage(error, 'toast-error','', 4000);
        }
      });
    }
  
    async handleVersionCheck() {
      if (this.platform.is(this.apiService.device_type as 'android' | 'ios')) {
        const latestVersion = this.app_data.APP_VERSION; // Assume API returns { "version": "1.2.0" }
        const currentVersion = await this.appVersion.getVersionNumber();
        console.log(`Latest Version: ${latestVersion}, Installed Version: ${currentVersion}`);
        if (this.isVersionOutdated(currentVersion, latestVersion)) {
          if(this.app_data.DEVICE_TYPE==this.apiService.device_type){
            this.versionAlert(this.app_data);
          }
        }
      }
    }
  
    isVersionOutdated(installed: string, latest: string): boolean {
      const installedParts = installed.split('.').map(Number);
      const latestParts = latest.split('.').map(Number);
      for (let i = 0; i < latestParts.length; i++) {
        if ((installedParts[i] || 0) < latestParts[i]) {
          return true;
        }
      }
      return false;
    }
  
    redirectToPlayStore(redirectUrl:string) {
      if (redirectUrl) {
        (navigator as any).app.exitApp();
        // this.inAppBrowser.create(redirectUrl, '_system'); // Opens in external browser
        if(this.device_type=='android'){
          this.inAppBrowser.create(redirectUrl, '_system');  //for mobile
        }
        else{
          window.open(redirectUrl, '_system');
        }
      } 
      else {
        console.error('Invalid Play Store URL');
      }
    }
  
    async versionAlert(app_data: any) {
      const buttons = [];
      if (app_data.UPDATE_TYPE === 'soft') {
        buttons.push({
          text: 'Cancel',
          cssClass: 'alert-button-no',
          handler: () => {
            console.log('Update skipped');
            this.alertCtrl.dismiss();
          }
        });
      }
      buttons.push({
        text: 'Update',
        cssClass: 'alert-button-yes',
        handler: () => {
          this.redirectToPlayStore(app_data.REDIRECT_URL);
        }
      });
      const confirm = await this.alertCtrl.create({
        header: 'Update App',
        message: app_data.MESSAGE,
        backdropDismiss: app_data.UPDATE_TYPE === 'soft', // Prevent closing for 'hard' updates
        buttons: buttons
      });
      await confirm.present();
    }

    // getSelectedTab(): void {
    //   this.selected = true;
    //   this.activeTabName = this.tabs.getSelected();
    //   this.tab_name=this.activeTabName
    // }
    getSelectedTab(): void {
      this.activeTabName = this.tabs.getSelected();
      this.tab_name = this.activeTabName;
      this.selectedTabLabel =
        this.currentUser?.user_type === 'Investor'
          ? 'Investments'
          : 'Booking';
      // Keep Dashboard route correct
      this.dashboardTab =
        this.currentUser?.user_type === 'Investor'
          ? 'investor-dashboard'
          : 'home';
      console.log('Selected Tab:', this.tab_name);
      console.log('Dashboard Tab:', this.dashboardTab);
    }
    // getSelectedTab(): void {
    //   this.activeTabName = this.tabs.getSelected();
    //   this.tab_name = this.activeTabName;
    //   this.selectedTabLabel =
    //     this.currentUser.user_type === 'Investor'
    //       ? 'Investments'
    //       : 'Booking';
    // }
    openPage(page:any) {
      this.selectedPath = page.url;
     this.router.navigate([page.url])
    }

    
}
