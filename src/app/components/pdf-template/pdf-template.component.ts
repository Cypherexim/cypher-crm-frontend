import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-template',
  templateUrl: './pdf-template.component.html',
  styleUrls: ['./pdf-template.component.scss']
})
export class PdfTemplateComponent {
  constructor() {}
  @Input() invoiceData:any = {};
  @Input() isProformaInvoice:boolean = true;
  @Input() isUserFromDelhi:boolean = false;

  // numToStr(num:any) {
  //   const formatter = new Intl.NumberFormat();
  //   return formatter.format(Number(num)); 
  // }

  numToStr(num:any) {
    const formatter = new Intl.NumberFormat(undefined, {currency: "INR", style: "currency"})
    return formatter.format(Number(num)).replace("₹", "");
  }
}
