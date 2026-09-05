import { Component } from '@angular/core';

interface Investment {
  refNo: string;
  title: string;
  status: string;
  statusClass: string;
  gatNo: string;
  sqft: string;
  progress: number;
  paidAmount: string;
  totalAmount: string;
  date: string;
}

@Component({
  selector: 'app-my-investment',
  templateUrl: './my-investment.page.html',
  styleUrls: ['./my-investment.page.scss'],
  standalone: false,
})
export class MyInvestmentPage {
  searchQuery: string = '';
  selectedTab: string = 'All';
  activeNav: string = 'Investments';

  tabs: string[] = ['All', 'Pending Payment', 'Document Verification'];

  navItems = [
    { name: 'Dashboard', inactiveIcon: 'assets/icons/dashboard.png', activeIcon: 'assets/icons/dashboard-active.png' },
    { name: 'Investments', inactiveIcon: 'assets/icons/investment.png', activeIcon: 'assets/icons/investment-active.png' },
    { name: 'Payment', inactiveIcon: 'assets/icons/payment.png', activeIcon: 'assets/icons/payment-active.png' },
    { name: 'Document', inactiveIcon: 'assets/icons/document.png', activeIcon: 'assets/icons/document-active.png' },
    { name: 'Profile', inactiveIcon: 'assets/icons/profile.png', activeIcon: 'assets/icons/profile-active.png' }
  ];

  investments: Investment[] = [
    {
      refNo: 'GF-20240115-001',
      title: 'Skybreez',
      status: 'Document Verification',
      statusClass: 'document-verification',
      gatNo: 'GT-45/2',
      sqft: '20,000 sq.ft',
      progress: 25,
      paidAmount: '5,00,000',
      totalAmount: '20,00,000',
      date: '15 Jan 2024'
    },
    {
      refNo: 'GF-20240115-001',
      title: 'Sarasview',
      status: 'Confirmed',
      statusClass: 'confirmed',
      gatNo: 'GT-45/2',
      sqft: '20,000 sq.ft',
      progress: 25,
      paidAmount: '5,00,000',
      totalAmount: '20,00,000',
      date: '15 Jan 2024'
    }
  ];

  filteredInvestments: Investment[] = [...this.investments];

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.filterInvestments();
  }

  filterInvestments() {
    this.filteredInvestments = this.investments.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            item.refNo.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesTab = this.selectedTab === 'All' || item.status === this.selectedTab;

      return matchesSearch && matchesTab;
    });
  }

  onNavClick(navName: string) {
    this.activeNav = navName;
  }
}