import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-lead-invoice',
  templateUrl: './lead-invoice.component.html',
  styleUrls: ['./lead-invoice.component.scss']
})
export class LeadInvoiceComponent implements OnInit, OnDestroy {
  constructor(
    public activeModal: NgbActiveModal,
    private apiService: ApiService,
    private utility: UtilitiesService
  ) {}

  @Output() callback:EventEmitter<any> = new EventEmitter<any>();
  apiSubscription1:Subscription = new Subscription();
  apiSubscription2:Subscription = new Subscription();

  currentStage:string = "";
  isApiInProcess:boolean = false;
  visibleDialogue:boolean = false;
  userData:any = {};
  doesUserBelongToDelhi:boolean = true;
  editFormType:string = "";
  tableHeadsTypes = {
    outOfDelhi: ["No.", "Item & Description", "HSN/SAC", "Qty", "Unit", "Rate", "Taxable", "IGST", "Amt", ""],
    insideDelhi: ["No.", "Item & Description", "HSN/SAC", "Qty", "Unit", "Rate", "Taxable", "CGST", "SGST", "Amt", ""]
  };
  tableHeads:string[] = [];
  reportType:string[] = ['ANALYSIS REPORT', 'Analysis Report  of  Vietnam Import', 'Analysis Report- OCT-22 TO SEP-23', 'BNG IMP REPORT', 'BUSINESS ANALYSIS REPORT', 'BUSINESS ANALYSIS REPORT - 1 YEAR', 'BUSINESS ANALYSIS REPORT - CURRENT 13 MONTHS', 'BUSINESS CONSULTING REPORT', 'BUSINESS CONUSLING REPORT', 'BUSINESS CONUSLTING REPORT', 'EXP MARKET RESEARCH REPORT', 'GLOBAL ANALYSIS REPORT', 'GLOBAL IMP EXP CONSULTING', 'IMP EXP CONSULTING', 'IMP EXP MARKET RESEARCH REPORT', 'IMPORT MARKET RESEARCH REPORT', 'MARKET  ANALYSIS REPORT', 'MARKET  ANALYSIS REPORT OF 3 MONTHS', 'MARKET  ANALYSIS REPORT OF 6 MONTHS', 'MARKET  ANALYSIS REPORT OF NOV  MONTH', 'MARKET RESEARCH REPORT', 'Market Analysis Report for 6 months', 'Market Analysis Report of 1 year', 'Market Analysis Report of 1 year (Nov-22 to Oct-23)', 'Market Analysis Report of 2 Months', 'Market Report', 'USA & PHILIEPPINES MARKET  REPORTS OF 6 MONTH', 'USA STATICS REPORT', 'hs code 1006 and 1201', 'import data', 'import export market research report'];
  selectedReport:string = "ANALYSIS REPORT";
  companyName:string = "";
  userName:string = "";
  taxNum:string = "";
  orderNum:number = 0;
  issuedBy:any = "";
  assigneeList:any[] = [];
  invoiceDate:string = this.utility.createTimeFormat().split(" ")[0];
  gstNum:string = "";
  tableData = {
    duration: "",
    hsnCode: 998371,
    qty: 1,
    unit: "no.s",
    rate: "",
    taxable: "",
    gst: {cgst: 9, sgst: 9, igst: 18},
    gstAmt: {cgst: 0, sgst: 0, igst: 0},
    amount: ""
  };
  bankDetails = {
    bankName: "ICICI BANK LIMITED",
    branch: "PARLIAMENT STREET, NEW DELHI-110001",
    accountNo: "663705600902",
    ifsc: "ICIC0006637"
  };

  isMailNeeded:string = "no";
  attachmentType:string[] = ["none"];
  
  isSameAdd:boolean = false;
  paymentStatus:string = "pending";
  address = {
    billing: {line1: "", line2: ""},
    shipping: {line1: "", line2: ""}
  };

  checkboxesOptions:any[] = [
    {key: "Proforma Invoice", val:"proforma"}, 
    {key: "Tax Invoice", val:"tax"}, 
    {key: "Tax Invoice with Stamp", val:"tax-stamp"}, 
    {key: "No Attachment", val:"none"}
  ];
  labels:string[] = ["issued_By", "username", "invoice_No", "invoice_Date"];

  ngOnInit(): void {
    if(this.doesUserBelongToDelhi) this.tableHeads = this.tableHeadsTypes.insideDelhi;
    else this.tableHeads = this.tableHeadsTypes.outOfDelhi;
    this.getAllUser();
  }

  onSetAttachment = (value:string) => this.attachmentType = [value];

  ngOnDestroy(): void {
    this.apiSubscription1.unsubscribe();
    this.apiSubscription2.unsubscribe();
  }

  onDismissModal = () => this.activeModal.dismiss('Cross click');

  onClickEdit(type:string) {
   this.visibleDialogue = true;
   this.editFormType = type;
  }

  onClickCheck(e:any) {
    this.isSameAdd = e.target.checked;
    if(this.isSameAdd) this.address.shipping = this.address.billing;
    else this.address.shipping = {line1: "", line2: ""};    
  }

  onBindUserData(userData:any) {
    const {address, gst_num, company_name, name, performa_num} = userData;
    this.doesUserBelongToDelhi = (address.toLowerCase()).includes("delhi");
    this.address.billing.line1 = address;
    this.gstNum = gst_num;
    this.companyName = company_name;
    this.userName = name;
    this.userData = {...userData};
    this.orderNum = performa_num;
  }

  convertNumToString(num:any, isWithCurrrency:boolean=true) {
    const formatter = isWithCurrrency 
    ? new Intl.NumberFormat(undefined, {currency: "INR", style: "currency"})
    : new Intl.NumberFormat();

    return formatter.format(Number(num));
  }

  onCalculateTax() {
    const {cgst, sgst, igst} = this.tableData.gst;
    const totalTax = this.doesUserBelongToDelhi ? cgst+sgst : igst;
    this.tableData.taxable = (((Number(this.tableData.rate) * totalTax) / 100)*this.tableData.qty)+"";
    this.tableData.amount = ((Number(this.tableData.taxable) + Number(this.tableData.rate))*this.tableData.qty)+"";

    this.tableData.gstAmt.sgst = ((Number(this.tableData.rate) * sgst) / 100)*this.tableData.qty;
    this.tableData.gstAmt.cgst = ((Number(this.tableData.rate) * cgst) / 100)*this.tableData.qty;
    this.tableData.gstAmt.igst = ((Number(this.tableData.rate) * igst) / 100)*this.tableData.qty;
  }

  onSubmit() {
    if(this.currentStage=="tax") {
      this.onDismissModal();
      return;
    }

    this.isApiInProcess = true;
    const {cgst, sgst, igst} = this.tableData.gst;
    const apiBody = {
      userId: this.userData?.user_id,
      planName: this.userData?.plan_name,
      invoiceDate: this.invoiceDate,
      address: [this.address.shipping, this.address.billing],
      taxNum: this.taxNum,
      performaNum: this.orderNum,
      issuedBy: Number(this.issuedBy),
      reportName: this.selectedReport,
      duration: this.tableData.duration,
      hsnSac: this.tableData.hsnCode,
      qty: this.tableData.qty,
      unit: this.tableData.unit,
      amount: [this.tableData.rate, this.tableData.amount],
      taxAmt: this.tableData.taxable,
      gstTax: {cgst, sgst, igst},
      bankData: JSON.stringify(this.bankDetails),
      isEmailSent: this.isMailNeeded=="yes",
      attachment: this.attachmentType,
      paymentStatus: this.paymentStatus.toString()
    };

    this.apiSubscription1 = this.apiService.addTaxInvoiceLeadAPI(apiBody).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.apiSubscription2 = this.apiService.updateStatusLeadAPI({email: this.userData?.email}).subscribe({
            next: (res:any) => {
              if(!res.error) {
                this.isApiInProcess = false;
                this.callback.emit(true);
                this.utility.showToastMsg("success", "SUCCESS", "Proforma Invoice has been updated to Tax Invoice.");
                this.onDismissModal();
              } else this.utility.showToastMsg("error", "ERROR", res.msg);
            }, error: (err:any) => console.log(err)
          });
        } else this.callback.emit(false);
      }, error: (err:any) => console.log(err)
    })
  }

  getAllUser() {
    const userId = this.utility.fetchUserSingleDetail("id");
    this.apiService.getAllUsersAPI(userId).subscribe({
      next: (res:any) => {
        if(!res.error) {this.assigneeList = res?.result;}
      }, error: (err:any) => {console.log(err);}
    });
  }

  onBindRestoredData(dataObj:any) {
    const {shipping_add, billing_add, CGST_taxPer, SGST_taxPer, IGST_taxPer, company_name, name, gst_num} = dataObj;
    const {bankName, branch, accountNo, ifsc} = JSON.parse(dataObj["bank_data"]);
    this.selectedReport = dataObj["report_name"];
    this.tableData.duration = dataObj["duration"];
    this.tableData.gst = {cgst: CGST_taxPer, sgst: SGST_taxPer, igst: IGST_taxPer}
    this.tableData.hsnCode = dataObj["HSN_SAC"];
    this.tableData.qty = dataObj["quantity"];
    this.tableData.rate = dataObj["amountBeforeTax"];
    this.tableData.amount = dataObj["amountAfterTax"];
    this.tableData.unit = dataObj["unit"];
    this.tableData.taxable = dataObj["tax_amt"];
    this.companyName = company_name;
    this.userName = name;
    this.gstNum = gst_num;
    this.issuedBy = dataObj["issued_by"];
    this.address.billing = {line1: (billing_add).split("~")[0], line2: (billing_add).split("~")[1]};
    this.doesUserBelongToDelhi = (this.address.billing.line1).toLowerCase().includes("delhi");
    this.taxNum = dataObj["tax_num"];
    this.orderNum = dataObj["performa_num"];
    this.invoiceDate = (dataObj["invoice_date"]).split("T")[0];
    this.bankDetails = {bankName, branch, accountNo, ifsc};
    if(dataObj["shipping_add"]!="") {
      this.isSameAdd = true;
      this.address.shipping = {line1: (shipping_add).split("~")[0], line2: (shipping_add).split("~")[1]};
    }
    this.onCalculateTax();
  }
}


/*
{
    "id": 10,
    "leadid": 171,
    "user_id": 4,
    "lead_data": "{\"company_name\":\"eximine\",\"name\":\"anonymous\",\"designation\":\"nothing\",\"department\":\"nothing\",\"address\":\"A-94, Uttrakhand enclave part 1, burari, delhi-110084, India\",\"contact\":\"1234567890\",\"email\":\"anony123@gmail.com\",\"location\":\"new delhi\",\"gst_num\":\"asfd234234\",\"pan_num\":\"asdfasfwawer\",\"remarks\":\"He is ready to pay. Make it ASAP!\",\"source\":\"offline\",\"iec_num\":\"sdfasdf34234\",\"last_followup\":null,\"next_followup\":null,\"assigned_from\":\"meenakshi\",\"lead_tracker\":\"[{\\\"time\\\":\\\"2023-08-18 15:29:00\\\",\\\"assignedUser\\\":4,\\\"assignedFrom\\\":3,\\\"remark\\\":\\\"He is ready to pay. Make it ASAP!\\\"},{\\\"time\\\":\\\"2023-08-16 12:59:00\\\",\\\"assignedUser\\\":3,\\\"assignedFrom\\\":2,\\\"remark\\\":\\\"price to meenakshi\\\"},{\\\"time\\\":\\\"2023-08-16 12:57:00\\\",\\\"assignedUser\\\":2,\\\"assignedFrom\\\":1,\\\"remark\\\":\\\"demo to pooja\\\"}]\",\"followup_tracker\":\"\",\"transaction_time\":\"2023-08-18T09:59:44.402Z\"}",
    "plan_name": "Enterprise",
    "invoice_date": "2023-08-20T18:30:00.000Z",
    "shipping_add": "A-94, Uttrakhand enclave part 1, burari, delhi-110084, India~burari dl-84",
    "billing_add": "A-94, Uttrakhand enclave part 1, burari, delhi-110084, India~burari dl-84",
    "PI_num": "2023-23EPL1234",
    "report_name": "BUSINESS ANALYSIS REPORT",
    "duration": "6 months",
    "HSN_SAC": "998371",
    "quantity": 1,
    "unit": "no.s",
    "amountBeforeTax": 45000,
    "amountAfterTax": 53100,
    "tax_amt": 8100,
    "CGST_taxPer": 9,
    "SGST_taxPer": 9,
    "IGST_taxPer": 18,
    "bank_data": "{\"bankName\":\"ICICI BANK LIMITED\",\"branch\":\"PARLIAMENT STREET, NEW DELHI-110001\",\"accountNo\":\"663705600902\",\"ifsc\":\"ICIC0006637\"}",
    "active": true,
    "transaction_time": "2023-08-21T07:09:18.892Z",
    "company_name": "eximine",
    "name": "anonymous",
    "gst_num": "asfd234234"
}
*/


/*
{
    "id": 6,
    "leadid": 169,
    "user_id": 4,
    "company_name": "eximine",
    "name": "saradha",
    "designation": "tele caller",
    "department": "sales",
    "address": "A-94, Uttrakhand enclave part 1, burari, delhi-110084, India",
    "contact": "1234567890",
    "email": "saradha12345@gmail.com",
    "location": "new delhi",
    "gst_num": "123asdf123",
    "pan_num": "1231asdf23",
    "remarks": "hurrayyyyyyyy",
    "source": "online",
    "iec_num": "1412341234",
    "last_followup": null,
    "next_followup": null,
    "assigned_from": "jitender",
    "lead_tracker": "[{\"time\":\"2023-08-18 15:53:00\",\"assignedUser\":4,\"assignedFrom\":1,\"remark\":\"hurrayyyyyyyy\"}]",
    "followup_tracker": "",
    "transaction_time": "2023-08-18T10:23:19.111Z",
    "plan_name": "enterprise "
}
*/