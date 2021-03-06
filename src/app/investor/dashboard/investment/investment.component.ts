import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Invest } from '../../invest/invest.interface';
import { AVAILABLE, PENDING_OWNER_AGREEMENT, INVESTED, FOR_SALE, PENDING_INVESTOR_AGREEMENT,
  RETURNED, DELAYED_RETURN, PENDING_ETHEREUM_CONFIRMATION } from '../../../common/interfaces/offer-asset-status.interface';
import { LinkService } from '../../../common/services/link.service';
import { SwapyProtocolService as SwapyProtocol } from '../../../common/services/swapy-protocol.service';
import { ToastrService } from '../../../common/services/toastr.service';
import { InvestService } from '../../invest/invest.service';
import { WalletService } from '../../../common/services/wallet.service';
import { ErrorLogService } from '../../../common/services/error-log.service';
import { StorageService } from '../../../common/services/storage.service';
import { Web3Service } from '../../../common/services/web3.service';
import { SellAssetService } from '../../sell-asset/sell-asset.service';
import { DashboardService } from '../dashboard.service';

const env = require('../../../../../env.json');

import * as sha1 from 'sha1';

@Component({
  selector: 'app-dashboard-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css']
})
export class InvestmentComponent implements OnInit {

  @Input() public assets;
  @Input() public collapsed: boolean;
  //
  private walletAddress;
  private delayed = [];

  public AVAILABLE = AVAILABLE;
  public PENDING_OWNER_AGREEMENT = PENDING_OWNER_AGREEMENT;
  public INVESTED = INVESTED;
  public RETURNED = RETURNED;
  public DELAYED_RETURN = DELAYED_RETURN;
  public FOR_SALE = FOR_SALE;
  public PENDING_INVESTOR_AGREEMENT = PENDING_INVESTOR_AGREEMENT;
  public PENDING_ETHEREUM_CONFIRMATION = PENDING_ETHEREUM_CONFIRMATION;

  public explorerUrl = (<any>env).BLOCK_EXPLORER_URL;

  constructor(private linkService: LinkService,
    private swapyProtocol: SwapyProtocol,
    private investService: InvestService,
    private toastrService: ToastrService,
    private errorLogService: ErrorLogService,
    private storageService: StorageService,
    private sellAssetService: SellAssetService,
    private router: Router,
    private web3Service: Web3Service,
    private dashboardService: DashboardService,
    private walletService: WalletService) { }

  ngOnInit() {
    // this.walletAddress = this.walletService.getWallet().address.toLowerCase();
  }

  public calculateReturnAmount(asset) {
    return asset.value * (1 + asset.grossReturn);
  }

  public calculatePaybackDate(asset) {
    const paybackDate = new Date(asset.investedAt);
    paybackDate.setMonth(paybackDate.getMonth() + asset.paybackMonths);
    return paybackDate;
  }

  public calculateAssetProgression(asset) {
    const paybackDate = new Date(asset.investedAt);
    const now = new Date();
    const monthsDiff = (now.getFullYear() * 12 + now.getMonth()) - (paybackDate.getFullYear() * 12 + paybackDate.getMonth());
    return monthsDiff;
  }

  public percentageProgression(asset) {
    const percentage = this.calculateAssetProgression(asset) * 100 / asset.paybackMonths;
    return Math.floor(percentage / 5) * 5;
  }

  public selectAsset(assetToSelect) {
    assetToSelect.selected = assetToSelect.selected === 0 ? 1 : 0;
    const count = this.assets.filter(asset => asset.selected === 1).length;
    if (count === 1) {
      this.assets.forEach(asset => {
        if (asset.status !== assetToSelect.status) {
          asset.selected = -1;
        }
      });
    } else {
      if (count === 0) {
        this.assets.forEach(asset => {
          asset.selected = 0;
        });
      }
    }

    this.dashboardService.setSelectedAssets(this.assets.filter(asset => asset.selected === 1));
  }

  public statusToString(status) {
    let statusString;
    switch (status) {
      case this.AVAILABLE:
        statusString = '';
        break;
      case this.PENDING_OWNER_AGREEMENT:
        statusString = 'Waiting';
        break;
      case this.INVESTED:
        statusString = 'Invested';
        break;
      case this.RETURNED:
        statusString = 'Returned';
        break;
      case this.FOR_SALE:
        statusString = 'On sale';
        break;
      case this.PENDING_INVESTOR_AGREEMENT:
        statusString = 'Waiting';
        break;
      case this.DELAYED_RETURN:
        statusString = 'Delayed return';
        break;
      case this.PENDING_ETHEREUM_CONFIRMATION:
        statusString = 'Pending transaction confirmation';
        break;
    }

    return statusString;

  }

  private onError(error, asset, status) {
    this.storageService.remove(asset.contractAddress);
    if (sha1(error.message) === '699e7c6d81ba58075ee84cf2a640c18a409efcba') { // 50 blocks later and transaction has not being mined yet.
      this.toastrService.error('Transaction is still being mined. Check it out later to see if the transaction was mined');
    } else {
      asset.status = status;
      this.toastrService.error(error.message);
    }
  }

  public exploreContract(address: string) {
    const url = this.explorerUrl + address;
    this.linkService.openLink(url);
  }

  public async cancelInvestment(asset) {
    const status = asset.status;
    this.storageService.setItem(asset.contractAddress, status);
    asset.status = PENDING_ETHEREUM_CONFIRMATION;
    try {
      await this.swapyProtocol.cancelInvestment(asset.contractAddress);
      this.toastrService.getInstance().success('Investment cancelled');
      this.storageService.getItem(asset.contractAddress);
    } catch (error) {
      this.onError(error, asset, status);
    }
  }

  public sellAsset(asset) {
    this.sellAssetService.cacheAsset(asset);
    this.router.navigate(['investor/sell']);
  }

  public async cancelSellOrder(asset) {
    const status = asset.status;
    this.storageService.setItem(asset.contractAddress, status);
    asset.status = PENDING_ETHEREUM_CONFIRMATION;
    try {
      await this.swapyProtocol.cancelSellOrder(asset.contractAddress);
      this.toastrService.getInstance().success('Asset deleted of the Marketplace');
      this.storageService.getItem(asset.contractAddress);
    } catch (error) {
      this.onError(error, asset, status);
    }
  }

  public async cancelSale(asset) {
    const status = asset.status;
    this.storageService.setItem(asset.contractAddress, status);
    asset.status = PENDING_ETHEREUM_CONFIRMATION;
    try {
      await this.swapyProtocol.cancelSale(asset.contractAddress);
      this.toastrService.getInstance().success('Purchase request cancelled');
      this.storageService.getItem(asset.contractAddress);
    } catch (error) {
      this.onError(error, asset, status);
    }
  }

  public async refuseSale(asset) {
    const status = asset.status;
    this.storageService.setItem(asset.contractAddress, status);
    asset.status = PENDING_ETHEREUM_CONFIRMATION;
    try {
      await this.swapyProtocol.refuseSale(asset.contractAddress);
      this.toastrService.getInstance().success('Purchase request cancelled');
      this.storageService.getItem(asset.contractAddress);
    } catch (error) {
      this.onError(error, asset, status);
    }
  }

  public async acceptSale(asset) {
    const status = asset.status;
    this.storageService.setItem(asset.contractAddress, status);
    asset.status = PENDING_ETHEREUM_CONFIRMATION;
    try {
      await this.swapyProtocol.acceptSale(asset.contractAddress);
      this.toastrService.getInstance().success('Asset sold');
      this.storageService.getItem(asset.contractAddress);
    } catch (error) {
      this.onError(error, asset, status);
    }
  }

  public async requireToken(asset) {
    const status = asset.status;
    this.storageService.setItem(asset.contractAddress, status);
    asset.status = PENDING_ETHEREUM_CONFIRMATION;
    try {
      await this.swapyProtocol.requireToken(asset.contractAddress);
      this.toastrService.getInstance().success('Tokens received');
      this.storageService.getItem(asset.contractAddress);
    } catch (error) {
      this.storageService.remove(asset.contractAddress);
      if (error.message === '699e7c6d81ba58075ee84cf2a640c18a409efcba') { // 50 blocks later and transaction has not being mined yet.
        this.toastrService.error('Transaction is still being mined. Check it out later to see if the transaction was mined');
      } else {
        asset.status = status;
        this.toastrService.error('Not eligible to receive SWAPY Tokens. Investment return is not delayed yet.');
      }
    }
  }
}
