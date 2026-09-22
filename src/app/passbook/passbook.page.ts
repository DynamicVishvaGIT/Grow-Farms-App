import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Api } from '../api';
import { ActionSheetController, AlertController, Platform, ToastController } from '@ionic/angular';
import { Common } from '../common';
import { User } from '../user';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';

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
export class PassbookPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  backButtonSub!: Subscription;

  currentUser:any;
  searchQuery: string = '';
  activeNav: string = 'Payment'; // Assuming Passbook falls under Payment / Wallet tab
  transactions: any=[];
  dataLoaded:boolean = true;

  filteredTransactions: any;
  booking_id: string | null='';

  constructor(
    private router: Router,private alertController: AlertController,private toastController: ToastController,private actionSheetController: ActionSheetController,
    private apiService: Api, private commonService: Common, private userService: User,  private activatedRoute: ActivatedRoute, private platform: Platform
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // this.loadPaymentSlabs();
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
    this.booking_id = this.activatedRoute.snapshot.paramMap.get('booking_id');
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url.includes('/passbook')){ // Check if user navigated back to a specific URL
          this.mobile_investor_passbook();
        }
    });
    // this.load_property();
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(
      9999,
      () => {
        this.onBack();
      }
    );
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  mobile_investor_passbook() {
    this.commonService.presentLoading();
    this.dataLoaded = false;
    this.apiService.mobile_investor_passbook()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.transactions = response?.data?.transactions;
      this.filteredTransactions = [...this.transactions];
      this.dataLoaded = true;
      this.commonService.dismissLoading();
    },
    respError => {
      this.dataLoaded = false;
      this.commonService.dismissLoading();
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  filterPassbook() {
    this.filteredTransactions = this.transactions.filter((item:any) => {
      return item.property.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
             item.reference_code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
             item.amount.includes(this.searchQuery);
    });
  }

  onNavClick(navName: string) {
    this.activeNav = navName;
  }

  onBack() {
    this.router.navigate(['/withdrawal-request', this.booking_id]);
  }
}