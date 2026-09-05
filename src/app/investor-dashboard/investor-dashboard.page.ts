import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-investor-dashboard',
  templateUrl: './investor-dashboard.page.html',
  styleUrls: ['./investor-dashboard.page.scss'],
  standalone: false
})
export class InvestorDashboardPage implements OnInit {
  selectedProperty: string = 'Skybreez';
  isDropdownOpen: boolean = false;
  propertyList: string[] = ['Skybreez', 'Kokan Mango Estate', 'Teakwood Valley', 'Azure Heights'];

  timeframes: string[] = ['1M', '3M', '6M', 'ALL'];
  selectedTimeframe: string = '3M';

  yearwiseData = [
    { year: '2021', heightPx: 60, isHighlight: false },
    { year: '2022', heightPx: 83.19, isHighlight: false },
    { year: '2023', heightPx: 108.8, isHighlight: false },
    { year: '2024', heightPx: 128, isHighlight: true }
  ];

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  selectTimeframe(tf: string) {
    this.selectedTimeframe = tf;
  }

  togglePropertyDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectPropertyOption(propName: string) {
    this.selectedProperty = propName;
    this.isDropdownOpen = false;
    this.presentToast(`Switched to ${propName}`);
  }

  openNotifications() {
    this.presentToast('Notifications opened');
  }

  openPromoBanner() {
    this.presentToast('Opening Limited Edition Pool Villas details');
  }

  openAssetDetails(assetId: string) {
    this.router.navigate(['/asset-details'], { queryParams: { id: assetId } });
  }

  viewAllAssets() {
    this.router.navigate(['/active-assets']);
  }

  switchTab(tabName: string) {
    switch(tabName) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'my-investment':
        this.router.navigate(['/my-investment']);
        break;
      case 'passbook':
        this.router.navigate(['/passbook']);
        break;
      case 'document':
        this.router.navigate(['/document']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
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
}