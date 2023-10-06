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
}
