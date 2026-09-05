import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Transaction {
  day: string;
  month: string;
  title: string;
  subText: string;
  amount: string;
  percentage: string;
  type: 'incoming' | 'outgoing';
}

@Component({
  selector: 'app-passbook',
  templateUrl: './passbook.page.html',
  styleUrls: ['./passbook.page.scss'],
  standalone:false,
})
export class PassbookPage {
searchQuery: string = '';
  activeNav: string = 'Payment'; // Assuming Passbook falls under Payment / Wallet tab

  // navItems = [
  //   { name: 'Dashboard', inactiveIcon: 'assets/icons/dashboard.png', activeIcon: 'assets/icons/dashboard-active.png' },
  //   { name: 'Investments', inactiveIcon: 'assets/icons/investment.png', activeIcon: 'assets/icons/investment-active.png' },
  //   { name: 'Payment', inactiveIcon: 'assets/icons/payment.png', activeIcon: 'assets/icons/payment-active.png' },
  //   { name: 'Document', inactiveIcon: 'assets/icons/document.png', activeIcon: 'assets/icons/document-active.png' },
  //   { name: 'Profile', inactiveIcon: 'assets/icons/profile.png', activeIcon: 'assets/icons/profile-active.png' }
  // ];

  transactions: Transaction[] = [
    {
      day: '09',
      month: 'Apr',
      title: 'Skybreez',
      subText: '1706265694/Invested amount',
      amount: '2500000',
      percentage: '(+20.5%)',
      type: 'incoming'
    },
    {
      day: '10',
      month: 'Apr',
      title: 'Skybreez',
      subText: '1706265694/Interest amount',
      amount: '2000',
      percentage: '(+20.5%)',
      type: 'incoming'
    },
    {
      day: '11',
      month: 'Apr',
      title: 'Skybreez',
      subText: '1706265694/withdrawal amount',
      amount: '100000',
      percentage: '(+20.5%)',
      type: 'outgoing'
    }
  ];

  filteredTransactions: Transaction[] = [...this.transactions];

  filterPassbook() {
    this.filteredTransactions = this.transactions.filter(item => {
      return item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
             item.subText.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
             item.amount.includes(this.searchQuery);
    });
  }

  onNavClick(navName: string) {
    this.activeNav = navName;
  }
}