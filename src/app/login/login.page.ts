import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  /*** Navigate to End User Login Page*/
  navigateToLoginByType() {
    console.log('Navigating to End User Login');
    this.router.navigate(['/login-by-type']);
  }

}
