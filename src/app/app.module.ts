import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot({innerHTMLTemplatesEnabled: true}), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, StatusBar, InAppBrowser, Camera, WebView,AppVersion,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // 👈 add this
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
