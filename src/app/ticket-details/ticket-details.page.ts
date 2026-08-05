import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { Common } from '../common';
import { Api } from '../api';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.page.html',
  styleUrls: ['./ticket-details.page.scss'],
  standalone: false,
})
export class TicketDetailsPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  ticket_id:string='';
  myTicketDetails:any;

  constructor(private userService: User, private activatedRoute: ActivatedRoute, private router: Router, private commonService: Common, private apiService: Api) { 
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
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
    const id = this.activatedRoute.snapshot.paramMap.get('ticket_id');
    if (id) {
      this.ticket_id = id;
    }
    console.log(this.ticket_id);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url.includes('/ticket-details')){ // Check if user navigated back to a specific URL
          this.view_ticket_details_mobile_app();
        }
    });
  }

  view_ticket_details_mobile_app() {
    this.commonService.presentLoading();
    // this.dataLoaded = false;
    let ticketData:any={ticket_id:''};
    ticketData['ticket_id'] = this.ticket_id;
    this.apiService.view_ticket_details_mobile_app(ticketData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myTicketDetails = response.data;
      this.commonService.dismissLoading();
    },
    respError => {
      this.commonService.dismissLoading();
      // this.dataLoaded = false;
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

}
