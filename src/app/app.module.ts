import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StorageService } from './common/services/storage.service';
import { HttpService } from './common/services/http.service';
import { I18nService } from './common/services/i18n.service';
import { LoadingService } from './common/services/loading.service';
import { LinkService } from './common/services/link.service';
import { Web3Service } from './common/services/web3.service';
import { WalletService } from './common/services/wallet.service';
import { EventService } from './common/services/event.service';
import { ExchangeProtocolService } from './common/services/protocol/exchange.service';
import { InvestmentOfferProtocolService } from './common/services/protocol/investment-offer.service';
import { InvestmentAssetProtocolService } from './common/services/protocol/investment-asset.service';
import { LogoutService } from './common/services/logout.service';
import { NgxElectronModule } from 'ngx-electron';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { ToastOptions } from 'ng2-toastr';
import { ToastrService } from './common/services/toastr.service';
import { CustomToastOption } from './common/CustomToastOption';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxElectronModule,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
  ],
  providers: [StorageService, HttpService, I18nService, LoadingService, LinkService, Web3Service,
    WalletService, EventService, ExchangeProtocolService, InvestmentOfferProtocolService,
    InvestmentAssetProtocolService, LogoutService, ToastrService, { provide: ToastOptions, useClass: CustomToastOption }],
  bootstrap: [AppComponent]
})
export class AppModule { }
