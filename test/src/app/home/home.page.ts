/* eslint-disable max-len */
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pairedList: pairedlist;
  listToggle = false;
  pairedDeviceID = 0;
  dataSend = '';


  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private toastCtrl: ToastController, private bluetoothSerial: BluetoothSerial) {
    this.checkBluetoothEnabled();
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled().then(success => {
      this.listPairedDevices();
    }, error => {
      this.showError('Please Enable Bluetooth');
    });
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
      this.pairedList = success;
      this.listToggle = true;
    }, error => {
      this.showError('Please Enable Bluetooth');
      this.listToggle = false;
    });
  }

  selectDevice() {
    const connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    }
    const address = connectedDevice.address;
    const name = connectedDevice.name;

    this.connect(address);
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.deviceConnected();
      this.showToast('Successfully Connected');
    }, error => {
      this.showError('Error:Connecting to Device');
    });
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe('\n').subscribe(success => {
      this.handleData(success);
      this.showToast('Connected Successfullly');
    }, error => {
      this.showError(error);
    });
  }

  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetoothSerial.disconnect();
    this.showToast('Device Disconnected');
  }

  handleData(data) {
    this.showToast(data);
  }

  sendData() {
    this.dataSend += '\n';
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error);
    });
  }

  async showError(error) {
    const alert = this.alertCtrl.create({
      header: 'Error',
      subHeader: error,
      buttons: ['Dismiss']
    });
    (await alert).present();
  }

  async showToast(msj) {
    const toast = this.toastCtrl.create({
      message: msj,
      duration: 1000
    });
    (await toast).present();

  }

}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface pairedlist {
  'class': number;
  'id': string;
  'address': string;
  'name': string;
}

