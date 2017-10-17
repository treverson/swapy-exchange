import { Injectable } from '@angular/core';

import { Web3Service } from '../web3.service';
import { WalletService } from '../wallet.service';

import { InvestmentAssetInterface as InvestmentAsset } from '../../../../../contracts/InvestmentAsset';
import { addresses } from '../../../../../contracts/address';
import { ProtocolAbstract } from './protocol.abstract';

@Injectable()
export class InvestmentAssetProtocolService extends ProtocolAbstract {

  protected abi = InvestmentAsset.abi;

  public agreeInvestment(id: string, investor: string, agreementTermsHash: string, value: number, contractAddress: string) {
    const encoded = super.getContract(contractAddress).methods.agreeInvestment(id, investor,
      this.web3Service.getInstance().utils.asciiToHex(agreementTermsHash), value).encodeABI();
    super.signAndSendTransaction(encoded, contractAddress);
  }

  public getContract(address) {
    this.contract = new this.web3.eth.Contract(this.abi, address);
    return this.contract;
  }

  public getEvents(eventUuid, eventName, contractAddress, cb) {
    this.getContract(contractAddress).getPastEvents(eventName, {
      fromBlock: 0,
      toBlock: 'latest'
    }, (error, events) => { cb(error, events.filter(event => event.returnValues._id === eventUuid)) });
  }
}
