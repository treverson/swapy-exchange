import { Component, OnInit, Input } from '@angular/core';
import { Invest } from '../../invest/invest.interface';
import { OPEN, SOLD, PENDING } from '../../../common/interfaces/offerAssetStatus.interface';

@Component({
  selector: 'dashboard-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css']
})
export class InvestmentComponent implements OnInit {

  @Input() public investment: Invest;
  @Input() public collapsed: boolean;

  public OPEN = OPEN;
  public SOLD = SOLD;
  public PENDING = PENDING;
  //
  public LOCKED = 2;
  public TX_AGREEMENT_PENDING = 3;
  public TX_AGREED = 4;
  public TX_INVEST_PENDING = 5;
  public TX_INVESTED = 6;

  constructor() { }

  ngOnInit() {
  }

  public toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  public calculateReturnAmount() {
    return this.investment.totalAmount * (1 + this.investment.roi);
  }

  public calculatePaybackDate() {
    const paybackDate = new Date(this.investment.investedIn);
    paybackDate.setMonth(paybackDate.getMonth() + this.investment.paybackMonths);
    return paybackDate;
  }

  public statusToString(status) {
    let statusString;
    switch (status) {
      case this.LOCKED:
        statusString = 'Pending ' + this.investment.companyName + '\'s confirmation';
        break;
      case this.TX_AGREEMENT_PENDING:
        statusString = 'Pending ' + this.investment.companyName + '\'s confirmation';
        break;
      case this.TX_AGREED:
        statusString = 'Asset accepted by ' + this.investment.companyName;
        break;
      case this.TX_INVEST_PENDING:
        statusString = 'Pending Ethereum confirmation';
        break;
      case this.TX_INVESTED:
        statusString = 'Asset succesfully invested';
        break;
    }

    return statusString;

  }

}
