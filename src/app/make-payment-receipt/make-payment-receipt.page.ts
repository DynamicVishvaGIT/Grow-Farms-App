import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { User } from '../user';
import { Common } from '../common';
import { Api } from '../api';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';

// Payment Data interface
interface PaymentData {
  selectedSlab: string;
  paymentMethod: string;
  paymentDate: string;
  amount: string;
  transactionId: string;
  note: string;
}

// Uploaded File interface
interface UploadedFile {
  name: string;
  size: number;
  type: string;
  data?: any;
}

@Component({
  selector: 'app-make-payment-receipt',
  templateUrl: './make-payment-receipt.page.html',
  styleUrls: ['./make-payment-receipt.page.scss'],
  standalone: false,
})
export class MakePaymentReceiptPage implements OnInit {

  private _unsubscribeAll: Subject<any>;

  currentUser:any;
  properties: any=[];
  selectedProperty: string = '';
  property_id:string='';
  paymentJson:any = {payment_slab:'',payment_method:'',payment_date:'',amount_paid:'',transaction_id:'',note:'', payment_receipt_image:'',property_id:''};
  isPaymentSlabSheetOpen = false;
  isPaymentMethodSheetOpen = false;
  myPaymentSlabs:any=[];
  payment_slab_name: string='';
  // Header data
  notificationCount: number = 1;

  // Payment data
  paymentData: PaymentData = {
    selectedSlab: '',
    paymentMethod: '',
    paymentDate: '',
    amount: '',
    transactionId: '',
    note: ''
  };

  // Uploaded file
  uploadedFile: File | null = null;
  uploadedFilePreview: string | null = null;   // ⭐ ADD
  isUploadingReceipt = false;

  // Available payment slabs
  availableSlabs = [
    { id: 1, name: 'Slab 1', amount: 550000, status: 'pending' },
    { id: 2, name: 'Slab 2', amount: 450000, status: 'pending' },
    { id: 3, name: 'Slab 3', amount: 550000, status: 'pending' },
    { id: 4, name: 'Slab 4', amount: 450000, status: 'pending' },
    { id: 5, name: 'Slab 5', amount: 550000, status: 'pending' }
  ];

  // Payment methods
  paymentMethods = ['Bank Transfer','UPI','Credit Card','Debit Card','Net Banking','Cheque','Cash'];

  constructor(
    private router: Router,private alertController: AlertController,private toastController: ToastController,private actionSheetController: ActionSheetController,
    private modalController: ModalController, private apiService: Api, private commonService: Common, private userService: User, private camera: Camera,
    private route: ActivatedRoute, private webview: WebView
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    console.log('Mark Payment page initialized');
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
    const property_id = this.route.snapshot.paramMap.get('property_id');
    if(property_id){
      this.property_id = property_id;
    }
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Ensure the event is of type NavigationEnd
      ).subscribe((event: NavigationEnd) => {
        if (event.url.includes('/make-payment-receipt')){ // Check if user navigated back to a specific URL
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
      this.properties = response.data;
      let index = this.commonService.findItem(this.properties,'property_id',this.property_id);
      if(index!=-1){
        this.selectedProperty = this.properties[index].property_name;
        this.property_id = response.data[index].property_id;
        this.paymentJson.property_id = response.data[index].property_id;
        this.get_payment_slabs('All');
      }
    },
    respError => {
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  get_payment_slabs(payment_status:string) {
    let paymentData:any={login_user_id:'',payment_status:'', booking_id:''};
    paymentData['login_user_id'] = this.currentUser.user_id;
    paymentData['payment_status'] = payment_status;
    paymentData['property_id'] = this.paymentJson.property_id;
    this.apiService.get_payment_slabs(paymentData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.myPaymentSlabs = response.data;
    },
    respError => {
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  /**
   * Handle notification icon click
   */
  async onNotificationClick() {
    console.log('Notification clicked');
    await this.showToast('Opening notifications...', 'primary');
    // this.router.navigate(['/notifications']);
  }

  /**
   * Select property
   */
  async selectProperty() {
    const buttons = this.properties.map((property:any) => ({
      text: property.property_name,
      handler: () => {
        this.selectedProperty = property.property_name;
        this.paymentJson.property_id = property.property_id;
        this.get_payment_slabs('All');
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
    // this.get_payment_slabs('All');
    await actionSheet.present();
  }

  /**
   * Select payment slab
   */
  async selectPaymentSlab() {
    if (this.isPaymentSlabSheetOpen) return;
    this.isPaymentSlabSheetOpen = true;
    const buttons = this.myPaymentSlabs
      .filter((slab:any) => slab.status === 'Pending' || slab.status === 'Overdue')
      .map((slab:any) => ({
        text: `Slab ${slab.slab_no} - ₹${slab.amount.toLocaleString('en-IN')}`,
        handler: () => {
          this.payment_slab_name = `Slab ${slab.slab_no} - ₹${slab.amount.toLocaleString('en-IN')}`
          this.paymentJson.payment_slab = slab.id;
          this.paymentJson.amount_paid = slab.amount.toString();
        }
      }));
  
    buttons.push({
      text: 'Cancel',
      handler: () => {}
    });
  
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Payment Slab',
      buttons: buttons
    });
    actionSheet.onDidDismiss().then(() => {
      this.isPaymentSlabSheetOpen = false;
    });
    await actionSheet.present();
  }

  /**
   * Select payment method
   */
  async selectPaymentMethod() {
    if (this.isPaymentMethodSheetOpen) return;
    this.isPaymentMethodSheetOpen = true;
    const buttons = this.paymentMethods.map(method => ({
      text: method,
      handler: () => {
        this.paymentJson.payment_method = method;
      }
    }));

    buttons.push({
      text: 'Cancel',
      handler: () => {}
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Payment Method',
      buttons: buttons
    });
    actionSheet.onDidDismiss().then(() => {
      this.isPaymentMethodSheetOpen = false;
    });
    await actionSheet.present();
  }

  /**
   * Upload receipt
   */
  async uploadReceipt() {

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
    //   // ⭐ CREATE PREVIEW
    //   this.uploadedFilePreview = 'data:image/jpeg;base64,' + imageData;
    //   this.showToast('Receipt uploaded successfully', 'success');
    // } catch (error) {
    //   console.log(error);
    // }
    // this.isUploadingReceipt = false;   // ⭐ end loading
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

  /**
   * Validate form
   */
  validateForm(): boolean {
    if (!this.paymentJson.property_id) {
      this.showToast('Please select a property id', 'warning');
      return false;
    }
    if (!this.paymentJson.payment_slab) {
      this.showToast('Please select a payment slab', 'warning');
      return false;
    }

    if (!this.paymentJson.payment_method) {
      this.showToast('Please select payment method', 'warning');
      return false;
    }

    if (!this.paymentJson.payment_date) {
      this.showToast('Please select payment date', 'warning');
      return false;
    }

    if (!this.paymentJson.amount_paid) {
      this.showToast('Please enter amount', 'warning');
      return false;
    }

    if (!this.paymentJson.transaction_id) {
      this.showToast('Please enter transaction ID', 'warning');
      return false;
    }

    if (this.isUploadingReceipt) {
      this.showToast('Please wait image is uploading...', 'warning');
      return false;
    }

    if (!this.uploadedFile) {
      this.showToast('Please upload payment receipt image', 'warning');
      return false;
    }
    return true;
  }

  /**
   * Submit payment
   */
  async submitPayment() {
    if (!this.validateForm()) {
      return;
    }
    const alert = await this.alertController.create({
      header: 'Submit Payment',
      message: 'Are you sure you want to submit this payment for verification?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: async () => {
            await this.processPayment();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Process payment submission
   */
  async processPayment() {
    this.commonService.presentLoading();
    const formData = new FormData();
    formData.append('user_id', this.currentUser.user_id);
    formData.append('property_id', this.property_id);
    formData.append('payment_slab', this.paymentJson.payment_slab);
    formData.append('payment_method', this.paymentJson.payment_method);
    formData.append('payment_date', this.paymentJson.payment_date);
    formData.append('amount_paid', this.paymentJson.amount_paid);
    formData.append('transaction_id', this.paymentJson.transaction_id);
    formData.append('note', this.paymentJson.note);
    formData.append('payment_receipt_image', this.uploadedFile as File);
    this.apiService.make_payments(formData)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response:any) => {
      console.log(response);
      this.commonService.showToastMessage(response.message, 'toast-success','', 4000);
      this.commonService.dismissLoading();
      this.resetForm();
      this.router.navigate(['/payment-slabs']);
    },
    respError => {
      this.commonService.dismissLoading();
      this.commonService.showToastMessage(respError, 'toast-error','', 4000);
    })
  }

  /**
   * Reset form
   */
  resetForm() {
    this.paymentJson = {
      property_id: '',
      payment_slab: '',
      payment_method: '',
      amount_paid: '',
      payment_date:'',
      transaction_id: '',
      note: ''
    };
    this.selectedProperty = this.properties[0].PROPERTY_NAME;
    this.property_id = this.properties[0].id;
    this.payment_slab_name = '';
    this.uploadedFile = null;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: string): string {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return `₹${num.toLocaleString('en-IN')}`;
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
