import { Injectable } from '@angular/core';
import { SwapyProtocolService as SwapyProtocol } from '../../common/services/swapy-protocol.service';
import { WalletService } from '../../common/services/wallet.service';
import { Web3Service } from '../../common/services/web3.service';
import { ErrorLogService } from '../../common/services/error-log.service';
import { LoadingService } from '../../common/services/loading.service';


@Injectable()
export class DashboardService {
  public investments;

  constructor(
    private swapyProtocol: SwapyProtocol,
    private errorLogService: ErrorLogService,
    private walletService: WalletService,
    private web3Service: Web3Service,
    private loadingService: LoadingService) { }

  public getCachedInvestments() {
    return this.investments;
  }

  private async getBlockTimestamp(blockHash: string) {
    return (await this.web3Service.getInstance().eth.getBlock(blockHash)).timestamp;
  }

  private async getAssetValues(assets: any[]): Promise<any[]> {
    const promises = [];
    assets.forEach(asset => {
      promises.push(this.swapyProtocol.getAsset(asset));
    });

    return Promise.all(promises);
  }

  private setInvestmentDetails(newInvestment, assetValues, investment) {
    newInvestment.paybackMonths = assetValues[3] / 30;
    newInvestment.totalAmount = assetValues[2] * investment.returnValues._assets.length / 100;
    newInvestment.grossReturn = assetValues[4] / 10000;
    newInvestment.creditCompanyAddress = assetValues[0];
  }

  private async buildNewInvestment(investment) {
    const timestamp = await this.getBlockTimestamp(investment.blockHash);

    return {
      investedIn: (new Date(timestamp * 1000)).toISOString(),
      assets: [],
      totalAmount: 0,
      grossReturn: 0,
      paybackMonths: 0,
      creditCompanyAddress: null
    };
  }

  async buildInvestment(investment) {
    const newInvestment = await this.buildNewInvestment(investment);

    const assets = await this.getAssetValues(investment.returnValues._assets);

    assets.forEach(async (asset, index) => {
      if (asset[6] === this.walletService.getWallet().address) {
        newInvestment.assets.push({
          contractAddress: investment.returnValues._assets[index],
          status: Number(asset[5]),
          value: asset[2] / 100
        });
      }

      if (!newInvestment.totalAmount) {
        this.setInvestmentDetails(newInvestment, asset, investment);
      }
    });

    return newInvestment;
  }

  public deleteDuplicatedAssets(investments) {
    for (let index = investments.length - 1; index >= 0; index--) {
        investments[index].assets.forEach(asset => {
          for (let i = index - 1; i >= 0; i--) {
            investments[i].assets.forEach((prevAsset, prevIndex) => {
              if (prevAsset.contractAddress.toLowerCase() === asset.contractAddress.toLowerCase()) {
                investments[i].assets.splice(prevIndex, 1);
              }
          });
        }
      });
    }

    return investments.filter(investment => investment.assets.length > 0);

  }

  async getMyInvestmentsFromBlockchain() {
    const investments = await this.swapyProtocol.get('Investments')
      .filter(investment => investment.returnValues._investor.toLowerCase() === this.walletService.getWallet().address.toLowerCase());

    const promises = [];
    investments.forEach((investment) => {
      promises.push(this.buildInvestment(investment));
    });
    this.investments = await Promise.all(promises);
    this.investments = this.deleteDuplicatedAssets(this.investments);
    return this.investments;
  }
}
