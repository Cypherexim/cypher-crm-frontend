import {  Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent {
  constructor(
    private eventService: EventsService,
    private utility: UtilitiesService
  ) {
    this.onPrintCommand();
    this.onPassingPdfData();
  }

  onClickPrint:boolean = false;
  pdfDocData:any = {};
  isUserFromDelhi:boolean = false;
  isProformaInvoice:boolean = false;
  eventSubscription1:Subscription = new Subscription();
  eventSubscription2:Subscription = new Subscription();

  onPrintCommand() {
    this.eventSubscription1 = this.eventService.onPassPrintCommand.subscribe({
      next: (res:boolean) => {this.onClickPrint = res;}, 
      error: (err:any) => console.log(err)
    });
  }

  onPassingPdfData() {
    this.eventSubscription2 = this.eventService.passPdfData.subscribe({
      next: (res:any) => {
        if(Object.keys(res).length>0) {
          const amtInStr = this.utility.convertNumberToWords(res["amount"][1]);
          res["bankData"] = JSON.parse(res["bankData"]);
          res["amoutInStr"] = amtInStr!=""? `Rupees ${amtInStr} Only`: amtInStr;
          this.isUserFromDelhi = res["gstNumber"].substring(0,2)=="07";
          this.isProformaInvoice = res["currentStage"]=="invoice";
          console.log(res)
          this.pdfDocData = res;
        }
      }, error: (err:any) => console.log(err)
    });
  }
}
