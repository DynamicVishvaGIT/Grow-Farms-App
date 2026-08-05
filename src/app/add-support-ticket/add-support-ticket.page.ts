import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController, ActionSheetButton } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { Api } from '../api';
import { Common } from '../common';
import { User } from '../user';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';

// Ticket Data interface
interface TicketData {
  category: string;
  paymentMethod: string;
  subject: string;
  description: string;
}

// Uploaded File interface
interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-add-support-ticket',
  templateUrl: './add-support-ticket.page.html',
  styleUrls: ['./add-support-ticket.page.scss'],
  standalone: false,
})
export class AddSupportTicketPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  ticketJson:any = {property_id:'',category_name:'',payment_method:'',subject:'',short_description:'',payment_receipt:''};
  currentUser:any;
  properties: any=[];
  // Selected Property
  selectedProperty: string = '';
  isCategorySheetOpen = false;
  isPaymentSheetOpen = false;

  // Ticket Data
  ticketData: TicketData = {
    category: '',
    paymentMethod: '',
    subject: '',
    description: ''
  };

  // Uploaded Files
  uploadedFiles: UploadedFile[] = [];

  uploadedFile: File | null = null;
  uploadedFilePreview: string | null = null;   // ⭐ ADD
  isUploadingReceipt = false;

  // Category Options
  categories: string[] = [
    'Payment',
    'Documentation',
    'Property Issues',
    'Legal',
    'Maintenance',
    'Booking',
    'Other'
  ];

  // Payment Method Options
  paymentMethods: string[] = [
    'Credit Card',
    'Debit Card',
    'Net Banking',
    'UPI',
    'Cheque',
    'Cash',
    'Bank Transfer'
  ];

  // Available Properties
  // properties: string[] = [
  //   'Skybreez',
  //   'Sarasview',
  //   'Green Valley',
  //   'Ocean View'
  // ];

  constructor(
    private router: Router,private alertController: AlertController,private toastController: ToastController,
    private actionSheetController: ActionSheetController, private apiService: Api, private commonService: Common,
    private userService: User, private camera: Camera, private webview: WebView
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    console.log('Create Support Ticket page initialized');
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
        if (event.url === '/add-support-ticket') { // Check if user navigated back to a specific URL
          this.load_dashboard_property();
        }
    });
    // this.load_property();
  }

  load_dashboard_property() {
    let propertyData:any={user_id:''};
    propertyData['user_id'] = this.currentUser.user_id;
    this.apiService.load_dashboard_property(propertyData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      // for(let i=0;i<response.data.length;i++){
      //   this.properties.push(response.data[i].PROPERTY_NAME);
      // }
      this.properties = response.data;
      this.selectedProperty = this.properties[0].property_name;
      console.log(this.properties);
      this.ticketJson.property_id = this.properties[0].property_id;
    },
    respError => {
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  /**
   * Select Property
   */
  async selectProperty() {
    const buttons = this.properties.map((property:any) => ({
      text: property.property_name,
      handler: () => {
        this.selectedProperty = property.property_name;
        this.ticketJson.property_id = property.property_id;
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
   * Select Category
   */
  async selectCategory() {
    if (this.isCategorySheetOpen) return;
    this.isCategorySheetOpen = true;
    const buttons: ActionSheetButton[] = this.categories.map(category => ({
      text: category,
      handler: () => {
        this.ticketJson.category_name = category;
      }
    }));
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Category',
      buttons
    });
    actionSheet.onDidDismiss().then(() => {
      this.isCategorySheetOpen = false;
    });
    await actionSheet.present();
  }

  /*** Select Payment Method*/
  async selectPaymentMethod() {
    if (this.isPaymentSheetOpen) return;
    this.isPaymentSheetOpen = true;
    const buttons: ActionSheetButton[] = this.paymentMethods.map(method => ({
      text: method,
      handler: () => {
        this.ticketJson.payment_method = method;
      }
    }));
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Payment Method',
      buttons
    });
    actionSheet.onDidDismiss().then(() => {
      this.isPaymentSheetOpen = false;
    });
    await actionSheet.present();
  }

  async uploadFiles() {

    this.isUploadingReceipt = true;   // ⭐ start loading

    const options: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY, // gallery
      correctOrientation: true
    };
  
    try {
      const imagePath = await this.camera.getPicture(options);
      // ⭐ VERY IMPORTANT (fix broken image)
      this.uploadedFilePreview = this.webview.convertFileSrc(imagePath);
      // ⭐ convert to blob
      const response = await fetch(this.uploadedFilePreview);
      const blob = await response.blob();
      const fileName = `receipt_${Date.now()}.jpg`;
      this.uploadedFile = new File([blob], fileName, {
        type: blob.type || 'image/jpeg'
      });
      console.log('FILE = ', this.uploadedFile);
      this.showToast('Receipt uploaded successfully', 'success');
    } catch (e) {
      console.log('ERROR', e);
    }
    this.isUploadingReceipt = false;
  
    //   const imageData = await this.camera.getPicture(options);
  
    //   // Convert base64 → File
    //   const blob = this.base64ToBlob(imageData, 'image/jpeg');
  
    //   const fileName = `receipt_${Date.now()}.jpg`;
  
    //   this.uploadedFile = new File([blob], fileName, {
    //     type: 'image/jpeg'
    //   });
  
    //   this.showToast('Receipt uploaded successfully', 'success');
  
    // } catch (error) {
    //   console.log(error);
    // }
  }

  base64ToBlob(base64Data: string, contentType: string) {

    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
  
      const slice = byteCharacters.slice(offset, offset + 512);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  }

  removeFile() {
    if (!this.uploadedFile) return;
    const name = this.uploadedFile.name;
    this.uploadedFile = null;
    this.uploadedFilePreview = null;   // ⭐ ADD

    this.showToast(`${name} removed`, 'dark');
  }

  /*** Upload Files*/
  // async uploadFiles() {
  //   // Create a file input element
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.multiple = true;
  //   input.accept = 'image/*,.pdf,.doc,.docx';

  //   input.onchange = (event: any) => {
  //     const files = event.target.files;
      
  //     if (files && files.length > 0) {
  //       for (let i = 0; i < files.length; i++) {
  //         const file = files[i];
          
  //         // Check file size (max 5MB)
  //         if (file.size > 5 * 1024 * 1024) {
  //           this.showToast('File size should not exceed 5MB', 'warning');
  //           continue;
  //         }

  //         // Add file to uploaded files list
  //         this.uploadedFiles.push({
  //           name: file.name,
  //           size: file.size,
  //           type: file.type
  //         });
  //       }

  //       if (files.length > 0) {
  //         this.showToast(`${files.length} file(s) uploaded`, 'success');
  //       }
  //     }
  //   };

  //   input.click();
  // }

  /**
   * Remove File
   */
  // removeFile(index: number) {
  //   const fileName = this.uploadedFiles[index].name;
  //   this.uploadedFiles.splice(index, 1);
  //   this.showToast(`${fileName} removed`, 'dark');
  // }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return !!(
      this.ticketJson.property_id &&
      this.ticketJson.category_name &&
      // this.ticketJson.payment_method &&
      this.ticketJson.subject &&
      this.ticketJson.short_description
    );
  }

  /**
   * Submit Ticket
   */
  async onSubmitTicket() {console.log(this.uploadedFile);
    if (!this.isFormValid()) {
      await this.showToast('Please fill all required fields', 'warning');
      return;
    }
    if (this.isUploadingReceipt) {
      this.showToast('Please wait image is uploading...', 'warning');
      return;
    }
    // if (!this.uploadedFile) {
    //   this.showToast('Please upload receipt first', 'warning');
    //   return;
    // }  

    const alert = await this.alertController.create({
      header: 'Confirm Submission',
      message: 'Are you sure you want to submit this support ticket?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: () => {
            this.add_ticket();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Submit ticket to server
   */
  private async add_ticket() {
    this.commonService.presentLoading();
    const formData = new FormData();
    formData.append('user_id', this.currentUser.user_id);
    formData.append('property_id', this.ticketJson.property_id);
    formData.append('category_name', this.ticketJson.category_name);
    if(this.ticketJson.payment_method){
      formData.append('payment_method', this.ticketJson.payment_method);
    }
    formData.append('subject', this.ticketJson.subject);
    formData.append('short_description', this.ticketJson.short_description);
    if(this.uploadedFile!=null){
      formData.append('payment_receipt', this.uploadedFile as File);
    }
    this.apiService.add_ticket(formData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.commonService.showToastMessage(response.message, 'toast-success','', 4000);
      this.commonService.dismissLoading();
      this.goBack();
    },
    respError => {
      this.commonService.dismissLoading();
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  /**
   * Reset Form
   */
  private resetForm() {
    this.ticketData = {
      category: '',
      paymentMethod: '',
      subject: '',
      description: ''
    };
    this.uploadedFiles = [];
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Go back
   */
  goBack() {
    this.router.navigate(['/profile']);
  }

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
