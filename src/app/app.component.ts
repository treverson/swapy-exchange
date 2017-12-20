import { Component, ViewContainerRef } from '@angular/core';
import { LoadingService } from './common/services/loading.service';
import { StorageService } from './common/services/storage.service';
import * as Web3 from 'web3';

import * as env from '../../env.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  loading = false;

  constructor(public loadingService: LoadingService, private storageService: StorageService, public viewContainerRef: ViewContainerRef) {
    this.loadingService.loadingShowed$.subscribe(
      showed => {this.loading = true}
    );

    this.loadingService.loadingHid$.subscribe(
      hid => {this.loading = false}
    );

    if (typeof (window as any).web3 !== 'undefined') {
      (window as any).web3 = new (Web3 as any)((window as any).web3.currentProvider);
    } else {
      (window as any).web3 = new (Web3 as any)((env as any).HTTP_PROVIDER);
    }

  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }

}
