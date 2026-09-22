import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { User } from '../user';
import { Api } from '../api';
import { Common } from '../common';

interface PropertyOption {
  id: number;
  property_name: string;
}

interface AllocationItem {
  name: string;
  percentage: number;
}

interface YearInterestItem {
  year: number;
  amount: number;
}

interface ChartDataPoint {
  month: string;
  year: number;
  label: string;
  portfolio_value: number;
}

interface ActiveAsset {
  booking_id: number;
  property_id: number;
  property_name: string;
  invested_amount: number;
  current_value: number;
  paid_amount: number;
  progress: number;
  status: string;
  image?: string;
}

@Component({
  selector: 'app-investor-dashboard',
  templateUrl: './investor-dashboard.page.html',
  styleUrls: ['./investor-dashboard.page.scss'],
  standalone: false
})
export class InvestorDashboardPage implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;

  currentUser: any;
  dataLoaded: boolean = false;

  // ---- API-driven state ----
  welcomeMessage: string = '';
  properties: PropertyOption[] = [];
  selectedPropertyId: number = 0;
  selectedProperty: string = 'All';

  portfolio = {
    portfolio_value: 0,
    invested_amount: 0,
    total_interest: 0,
    growth_percentage: '0.0',
    total_assets: 0
  };

  chartData: ChartDataPoint[] = [];
  allocation: AllocationItem[] = [];
  yearWiseInterest: YearInterestItem[] = [];
  activeAssets: ActiveAsset[] = [];
  banner = {
    title: '',
    price: '',
    description: ''
  };

  // ---- static UI state ----
  timeframes: string[] = ['1M', '3M', '6M', 'ALL'];
  selectedTimeframe: string = 'ALL';
  isDropdownOpen: boolean = false;

  readonly defaultAssetImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&auto=format&fit=crop&q=80';

  private readonly allocationColors: string[] = [
    '#FF9900', '#00BA76', '#3B82F6', '#A855F7', '#EF4444', '#06B6D4'
  ];

  // SVG chart geometry (viewBox 0 0 320 90)
  private readonly chartWidth = 320;
  private readonly chartHeight = 90;
  private readonly chartTopPad = 10;
  private readonly chartBottomPad = 15; // keeps line off the very bottom edge

  linePath: string = '';
  areaPath: string = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private userService: User,
    private apiService: Api,
    private commonService: Common
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
        }
      }
    });

    // this.loadDashboard(this.selectedPropertyId, this.selectedTimeframe);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/investor-dashboard') {
        this.loadDashboard(this.selectedPropertyId, this.selectedTimeframe);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  doRefresh(event: any) {
    this.loadDashboard(this.selectedPropertyId, this.selectedTimeframe, () => event.target.complete());
  }

  // ---- API call ----
  loadDashboard(propertyId: number, period: string = 'ALL', onComplete?: () => void) {
    this.commonService.presentLoading();
    this.dataLoaded = false;

    const formData = new FormData();
    formData.append('property_id', String(propertyId));
    formData.append('period', period);
    if (this.currentUser?.user_id) {
      formData.append('user_id', this.currentUser.user_id);
    }

    this.apiService.investor_dashboard(formData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        console.log(response);
        this.applyDashboardResponse(response);
        this.dataLoaded = true;
        this.commonService.dismissLoading();
        if (onComplete) onComplete();
      }, respError => {
        this.dataLoaded = true;
        this.commonService.dismissLoading();
        this.commonService.showToastMessage(respError, 'toast-error', '', 4000);
        if (onComplete) onComplete();
      });
  }

  private applyDashboardResponse(response: any) {
    this.welcomeMessage = response?.welcome_message || '';
    this.properties = response?.property_dropdown || [];

    this.portfolio = {
      portfolio_value: response?.portfolio?.portfolio_value ?? 0,
      invested_amount: response?.portfolio?.invested_amount ?? 0,
      total_interest: response?.portfolio?.total_interest ?? 0,
      growth_percentage: response?.portfolio?.growth_percentage ?? '0.0',
      total_assets: response?.portfolio?.total_assets ?? 0
    };

    this.chartData = response?.portfolio?.chart_data || [];
    this.allocation = response?.allocation || [];
    this.yearWiseInterest = response?.year_wise_interest || [];
    this.activeAssets = response?.active_assets || [];
    this.banner = response?.banner || { title: '', price: '', description: '' };

    if (response?.selected_period) {
      this.selectedTimeframe = response.selected_period;
    }

    const match = this.properties.find(p => p.id === this.selectedPropertyId);
    this.selectedProperty = match ? match.property_name : (this.properties[0]?.property_name || 'All');

    this.buildChartPaths();
  }

  // ---- property selector ----
  async selectProperty() {
    const buttons = this.properties.map((property) => ({
      text: property.property_name,
      handler: () => {
        this.selectedPropertyId = property.id;
        this.selectedProperty = property.property_name;
        this.loadDashboard(property.id, this.selectedTimeframe);
      }
    }));

    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      handler: () => {}
    } as any);

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Property',
      buttons
    });

    await actionSheet.present();
  }

  // ---- timeframe click handler ----
  selectTimeframe(tf: string) {
    if (this.selectedTimeframe === tf) return;
    this.selectedTimeframe = tf;
    this.loadDashboard(this.selectedPropertyId, tf);
  }

  openNotifications() {
    this.presentToast('Notifications opened');
  }

  openPromoBanner() {
    this.presentToast(`Opening ${this.banner.title || 'promo'} details`);
  }

  openAssetDetails(bookingId: number) {
    this.router.navigate(['/asset-details'], { queryParams: { id: bookingId } });
  }

  viewAllAssets() {
    this.router.navigate(['/active-assets']);
  }

  switchTab(tabName: string) {
    switch (tabName) {
      case 'dashboard': this.router.navigate(['/dashboard']); break;
      case 'my-investment': this.router.navigate(['/my-investment']); break;
      case 'passbook': this.router.navigate(['/passbook']); break;
      case 'document': this.router.navigate(['/document']); break;
      case 'profile': this.router.navigate(['/profile']); break;
    }
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'top',
      color: 'dark'
    });
    await toast.present();
  }

  // ---- computed helpers used by template ----

  get isPositiveGrowth(): boolean {
    return parseFloat(this.portfolio.growth_percentage) >= 0;
  }

  get donutBackground(): string {
    if (!this.allocation || this.allocation.length === 0) {
      return '#EEEEEE';
    }
    if (this.allocation.length === 1) {
      return this.allocationColors[0];
    }

    const stops: string[] = [];
    let cumulative = 0;
    const gap = 2;

    this.allocation.forEach((item, index) => {
      const color = this.getAllocationColor(index);
      const start = cumulative;
      const rawEnd = cumulative + (item.percentage / 100) * 360;
      const end = Math.max(start, rawEnd - gap);
      stops.push(`${color} ${start}deg ${end}deg`);
      stops.push(`#FFFFFF ${end}deg ${rawEnd}deg`);
      cumulative = rawEnd;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  getAllocationColor(index: number): string {
    return this.allocationColors[index % this.allocationColors.length];
  }

  get maxYearInterest(): number {
    if (!this.yearWiseInterest || this.yearWiseInterest.length === 0) return 0;
    return Math.max(...this.yearWiseInterest.map(y => y.amount), 0);
  }

  get peakInterestLabel(): string {
    return this.formatLakh(this.maxYearInterest);
  }

  getBarHeight(amount: number): number {
    const maxHeight = 128;
    const minHeight = 6;
    if (this.maxYearInterest <= 0) return minHeight;
    const h = (amount / this.maxYearInterest) * maxHeight;
    return Math.max(h, minHeight);
  }

  getBarColor(index: number, total: number): string {
    if (total <= 1) return '#A0522D';
    const ratio = index / (total - 1);
    if (ratio >= 0.9) return '#A0522D';
    const alpha = Math.round(0x40 + ratio * (0xFF - 0x40)).toString(16).padStart(2, '0');
    return `#FF9900${alpha}`;
  }

  isLastBar(index: number, total: number): boolean {
    return index === total - 1;
  }

  getAssetGrowth(asset: ActiveAsset): number {
    if (!asset.invested_amount) return 0;
    return Math.round(((asset.current_value - asset.invested_amount) / asset.invested_amount) * 1000) / 10;
  }

  getAssetBadgeText(asset: ActiveAsset): string {
    if (asset.status && asset.status.toLowerCase() !== 'active') {
      return asset.status;
    }
    const growth = this.getAssetGrowth(asset);
    return `${growth >= 0 ? '+' : ''}${growth}%`;
  }

  getAssetBadgeClass(asset: ActiveAsset): string {
    if (asset.status && asset.status.toLowerCase() === 'pending payment') {
      return 'asset-badge-pending';
    }
    const growth = this.getAssetGrowth(asset);
    return growth >= 0 ? 'asset-badge-green' : 'asset-badge-red';
  }

  getAssetProgress(asset: ActiveAsset): number {
    if (!asset.invested_amount || asset.invested_amount <= 0) return 0;
    const ratio = (asset.current_value / asset.invested_amount) * 100;
    return Math.min(100, Math.max(0, ratio));
  }

  formatIndianCurrency(amount: number): string {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    const num = Math.round(amount);
    const isNegative = num < 0;
    const absStr = Math.abs(num).toString();
    let lastThree = absStr.substring(absStr.length - 3);
    const other = absStr.substring(0, absStr.length - 3);
    if (other !== '') {
      lastThree = ',' + lastThree;
    }
    const formatted = other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return (isNegative ? '-₹' : '₹') + formatted;
  }

  formatLakh(amount: number): string {
    if (!amount) return '₹0';
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  // ---- growth chart path builder (keeps existing SVG look, feeds it real data) ----
  private buildChartPaths() {
    if (!this.chartData || this.chartData.length === 0) {
      // fallback to original static-looking curve so card never looks broken
      this.linePath = 'M0,70 C60,65 110,75 160,45 C210,15 260,30 320,10';
      this.areaPath = 'M0,70 C60,65 110,75 160,45 C210,15 260,30 320,10 L320,90 L0,90 Z';
      return;
    }

    const values = this.chartData.map(d => d.portfolio_value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const usableHeight = this.chartHeight - this.chartTopPad - this.chartBottomPad;

    const points = this.chartData.map((d, i) => {
      const x = this.chartData.length === 1
        ? this.chartWidth / 2
        : (i / (this.chartData.length - 1)) * this.chartWidth;

      let y: number;
      if (maxVal === minVal) {
        // flat line (e.g. all zeros) — draw centered flat line, not a squashed spike
        y = this.chartTopPad + usableHeight / 2;
      } else {
        const ratio = (d.portfolio_value - minVal) / (maxVal - minVal);
        y = this.chartTopPad + usableHeight - ratio * usableHeight;
      }
      return { x, y };
    });

    this.linePath = this.buildSmoothPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    this.areaPath = `${this.linePath} L${last.x},${this.chartHeight} L${first.x},${this.chartHeight} Z`;
  }

  // Catmull-rom style smoothing into cubic bezier, matching the original hand-drawn curve style
  private buildSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;

    let d = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return d;
  }

  goToInvestment() {
    this.router.navigate(['/my-bookings']);
  }
}
// import { Component, OnInit } from '@angular/core';
// import { NavigationEnd, Router } from '@angular/router';
// import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
// import { filter, Subject, takeUntil } from 'rxjs';
// import { User } from '../user';
// import { Api } from '../api';
// import { Common } from '../common';

// @Component({
//   selector: 'app-investor-dashboard',
//   templateUrl: './investor-dashboard.page.html',
//   styleUrls: ['./investor-dashboard.page.scss'],
//   standalone: false
// })
// export class InvestorDashboardPage implements OnInit {

//   private _unsubscribeAll: Subject<any>;

//   currentUser: any;
//   property_id:string='';
//   properties:any=[];
//   selectedProperty: string = '';
//   dataLoaded:boolean=true;
//   dashboardData:any;

//   notificationCount: number = 1;

//   // Progress Circle Calculations
//   circumference: number = 2 * Math.PI * 58; // radius = 58
//   dashOffset: number = 0;
//   // selectedProperty: string = 'Skybreez';
//   isDropdownOpen: boolean = false;
//   propertyList: string[] = ['Skybreez', 'Kokan Mango Estate', 'Teakwood Valley', 'Azure Heights'];

//   timeframes: string[] = ['1M', '3M', '6M', 'ALL'];
//   selectedTimeframe: string = '3M';

//   yearwiseData = [
//     { year: '2021', heightPx: 60, isHighlight: false },
//     { year: '2022', heightPx: 83.19, isHighlight: false },
//     { year: '2023', heightPx: 108.8, isHighlight: false },
//     { year: '2024', heightPx: 128, isHighlight: true }
//   ];

//   constructor(
//     private router: Router,private alertController: AlertController,private toastController: ToastController, private actionSheetController: ActionSheetController,
//     private userService: User, private apiService: Api, private commonService: Common
//   ) {
//     this._unsubscribeAll = new Subject();
//   }

//   ngOnInit() {
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
//     // this.calculateProgress();
//     // this.loadDashboardData();
//     this.router.events.pipe(
//       filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
//       ).subscribe((event: NavigationEnd) => {
//         if (event.url === '/investor-dashboard') { // Check if user navigated back to a specific URL
//           this.load_dashboard_property();
//         }
//     });
//   }

//   doRefresh(event:any) {
//     setTimeout(() => {
//       this.load_dashboard_property();
//       event.target.complete();
//     }, 2000);
//   }

//   load_dashboard_property() {
//     let propertyData:any={user_id:''};
//     propertyData['user_id'] = this.currentUser.user_id;
//     this.apiService.load_dashboard_property(propertyData)
//     .pipe(takeUntil(this._unsubscribeAll))
//     .subscribe((response:any) => {
//       console.log(response);
//       this.properties = response.data;
//       this.selectedProperty = this.properties[0].property_name;
//       console.log(this.properties);
//       this.property_id = response.data[0].property_id;
//       this.investor_dashboard();
//     },
//     respError => {
//       this.commonService.showToastMessage(respError, 'toast-error','', 4000);
//     })
//   }

//   async selectProperty() {
//     const buttons = this.properties.map((property:any) => ({
//       text: property.property_name,
//       handler: () => {
//         this.selectedProperty = property.property_name;
//         this.property_id = property.property_id;
//         this.investor_dashboard();
//       }
//     }));

//     buttons.push({
//       text: 'Cancel',
//       handler: () => {}
//     });

//     const actionSheet = await this.actionSheetController.create({
//       header: 'Select Property',
//       buttons: buttons
//     });

//     await actionSheet.present();
//   }

//   investor_dashboard() {
//     this.commonService.presentLoading();
//     this.dataLoaded = false;
//     // let documentData:any={user_id:'',property_id:''};
//     // documentData['user_id'] = this.currentUser.user_id;
//     // documentData['property_id'] = this.property_id;
//     let formData = new FormData();
//     formData.append("property_id",this.property_id),
//     this.apiService.investor_dashboard(formData)
//     .pipe(takeUntil(this._unsubscribeAll))
//     .subscribe((response:any) => {
//       console.log(response);
//       this.dashboardData = response;
//       // this.calculateProgress();
//       this.dataLoaded = true;
//       this.commonService.dismissLoading();
//     },
//     respError => {
//       this.commonService.dismissLoading();
//       this.dataLoaded = false;
//       this.commonService.showToastMessage(respError, 'toast-error','', 4000);
//     })
//   }

//   selectTimeframe(tf: string) {
//     this.selectedTimeframe = tf;
//   }

//   togglePropertyDropdown() {
//     this.isDropdownOpen = !this.isDropdownOpen;
//   }

//   selectPropertyOption(propName: string) {
//     this.selectedProperty = propName;
//     this.isDropdownOpen = false;
//     this.presentToast(`Switched to ${propName}`);
//   }

//   openNotifications() {
//     this.presentToast('Notifications opened');
//   }

//   openPromoBanner() {
//     this.presentToast('Opening Limited Edition Pool Villas details');
//   }

//   openAssetDetails(assetId: string) {
//     this.router.navigate(['/asset-details'], { queryParams: { id: assetId } });
//   }

//   viewAllAssets() {
//     this.router.navigate(['/active-assets']);
//   }

//   switchTab(tabName: string) {
//     switch(tabName) {
//       case 'dashboard':
//         this.router.navigate(['/dashboard']);
//         break;
//       case 'my-investment':
//         this.router.navigate(['/my-investment']);
//         break;
//       case 'passbook':
//         this.router.navigate(['/passbook']);
//         break;
//       case 'document':
//         this.router.navigate(['/document']);
//         break;
//       case 'profile':
//         this.router.navigate(['/profile']);
//         break;
//     }
//   }

//   async presentToast(msg: string) {
//     const toast = await this.toastController.create({
//       message: msg,
//       duration: 1500,
//       position: 'top',
//       color: 'dark'
//     });
//     await toast.present();
//   }
// }