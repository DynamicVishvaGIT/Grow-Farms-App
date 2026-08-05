import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { User } from '../user';
import { Api } from '../api';
import { Common } from '../common';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

// Document interface
interface Document {
  id: number;
  title: string;
  category: string;
  categoryClass: string;
  iconName: string;
  fileType: string;
  uploadDate: string;
  fileSize?: string;
  fileUrl?: string;
}

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.page.html',
  styleUrls: ['./document-list.page.scss'],
  standalone: false,
})
export class DocumentListPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  dataLoaded: boolean = true;
  myDocuments:any=[];
  // Header data
  notificationCount: number = 1;
  selectedProperty: string = '';

  // Filter
  selectedFilter: string = 'all';

  // Stats
  legalCount: number = 0;
  financialCount: number = 0;
  technicalCount: number = 0;
  filteredDocuments: any = [];
  properties:any=[];
  property_name: string='';

  constructor(
    private router: Router,private alertController: AlertController,private toastController: ToastController,private iab: InAppBrowser,
    private actionSheetController: ActionSheetController, private userService: User, private apiService: Api, private commonService: Common
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // this.loadDocuments();
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
        if (event.url === '/document-list') { // Check if user navigated back to a specific URL
          this.load_dashboard_property();
          this.load_customer_documents('all');
        }
    });
    
  }

  doRefresh(event:any) {
    setTimeout(() => {
      this.load_dashboard_property();
      this.load_customer_documents('all');
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
      this.property_name = this.selectedProperty;
    },
    respError => {
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  load_customer_documents(category_name:string) {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    let documentData:any={user_id:'',category_name:''};
    documentData['user_id'] = this.currentUser.user_id;
    documentData['category_name'] = category_name;
    this.apiService.load_customer_documents(documentData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myDocuments = response.documents;
      response.category_counts.forEach((item: any) => {
        const category = item.CATEGORY?.toLowerCase();
        if (category === 'legal') {
          this.legalCount = item.count;
        }
        if (category === 'financial') {
          this.financialCount = item.count;
        }
        if (category === 'technical') {
          this.technicalCount = item.count;
        }
      
      });
      // this.category_counts = response.category_counts;
      this.selectedFilter = category_name;
      this.filteredDocuments = [...this.myDocuments];
      this.dataLoaded = true;
      this.commonService.dismissLoading();
    },
    respError => {
      this.commonService.dismissLoading();
      this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  // ionViewWillEnter() {
  //   // Refresh data when view enters
  //   this.loadDocuments();
  // }

  /**
   * Load documents data
   */
  // private loadDocuments() {
  //   // TODO: Implement API call to fetch documents
  //   console.log('Loading documents...');

  //   // Calculate stats
  //   this.calculateStats();

  //   // Apply initial filter
  //   this.filterDocuments(this.selectedFilter);
  // }

  /**
   * Calculate document statistics
   */
  // private calculateStats() {
  //   this.legalCount = this.documents.filter(d => d.categoryClass === 'legal').length;
  //   this.financialCount = this.documents.filter(d => d.categoryClass === 'financial').length;
  //   this.technicalCount = this.documents.filter(d => d.categoryClass === 'technical').length;
  // }

  /**
   * Filter documents based on category
   */
  // filterDocuments(filter: string) {
  //   this.selectedFilter = filter;

  //   switch (filter) {
  //     case 'all':
  //       this.filteredDocuments = [...this.documents];
  //       break;
  //     case 'legal':
  //       this.filteredDocuments = this.documents.filter(d => d.categoryClass === 'legal');
  //       break;
  //     case 'financial':
  //       this.filteredDocuments = this.documents.filter(d => d.categoryClass === 'financial');
  //       break;
  //     case 'technical':
  //       this.filteredDocuments = this.documents.filter(d => d.categoryClass === 'technical');
  //       break;
  //     default:
  //       this.filteredDocuments = [...this.documents];
  //   }

  //   console.log('Filtered documents:', this.filteredDocuments);
  // }

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
  async selectProperty() {
    const buttons = this.properties.map((property:any) => ({
      text: property.property_name,
      handler: () => {
        this.selectedProperty = property.property_name;
        this.property_name = this.selectedProperty;
        this.load_customer_documents(this.selectedFilter);
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

  /**
   * Download document
   */
  async downloadDocument(doc: Document) {
    console.log('Downloading document:', doc);
    
    await this.showToast(`Downloading ${doc.title}...`, 'primary');

    // TODO: Implement actual download logic
    setTimeout(async () => {
      await this.showToast('Document downloaded successfully!', 'success');
    }, 1500);
  }

  /**
   * View document
   */
  async viewDocument(doc: any) {
    if (!doc.view_url) return;
    this.iab.create(
      doc.view_url,
      '_system'   // opens using mobile viewer / browser
    );
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
        // this.router.navigate(['/payment']);
        this.showToast('Payment page', 'primary');
        break;
      case 'document':
        // Already on document page
        break;
      case 'profile':
        // this.router.navigate(['/profile']);
        this.showToast('Profile page', 'primary');
        break;
    }
  }

  /**
   * Get total documents count
   */
  // getTotalDocuments(): number {
  //   return this.documents.length;
  // }

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
