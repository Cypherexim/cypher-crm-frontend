import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { EllipsisPipe } from 'src/app/common/ellipsis.pipe';
import { ApiService } from 'src/app/services/api.service';
import { EventsService } from 'src/app/services/events.service';
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
    private utility: UtilitiesService,
    private ellipsesPipe: EllipsisPipe,
    private eventService: EventsService
  ) {}

  @Output() callback:EventEmitter<any> = new EventEmitter<any>();
  @Output() printCallback:EventEmitter<any> = new EventEmitter<any>();
  apiSubscription1:Subscription = new Subscription();
  apiSubscription2:Subscription = new Subscription();
  apiSubscription3:Subscription = new Subscription();
  apiSubscription4:Subscription = new Subscription();
  apiSubscription5:Subscription = new Subscription();
  apiSubscription6:Subscription = new Subscription();
  eventSubscription:any;

  currentStage:string = "";
  leadId:number = 0;
  onlyId:number = 0;
  isApiInProcess:boolean = false;
  visibleDialogue:boolean = false;
  visibleDialogue2:boolean = false;
  visibleDialogue3:boolean = false;
  isAddPI:boolean = false;
  isAddingNewPI:boolean = false;
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
  orderNum:string = "";
  issuedBy:any = "";
  companiesList:any[] = [];
  copyCompaniesList:any[] = [];
  choosenCompany:any = {id: "", name: ""};
  keyUpCompanyStr:string = "";
  assigneeList:any[] = [];
  errorTypes:any[] = ["", "null", null, "undefined", undefined];
  invoiceDate:string = this.utility.createTimeFormat().split(" ")[0];
  gstNum:string = "";
  emailArr:string[] = [];
  email:string = "";
  phone:string = "";
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
  portalDataType:string = "online";
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
  labels:string[] = [];

  ngOnInit(): void {
    if(this.doesUserBelongToDelhi) this.tableHeads = this.tableHeadsTypes.insideDelhi;
    else this.tableHeads = this.tableHeadsTypes.outOfDelhi;
    this.getAllUser();
    this.getCompaniesList();
    setTimeout(() => this.eventService.onPassPrintCommand.next(true), 2000);
  }

  onSetAttachment = (value:string) => this.attachmentType = [value];

  ngOnDestroy(): void {
    this.apiSubscription1.unsubscribe();
    this.apiSubscription2.unsubscribe();
    this.apiSubscription3.unsubscribe();
    this.apiSubscription4.unsubscribe();
    this.apiSubscription5.unsubscribe();
    this.apiSubscription6.unsubscribe();
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
    const {address, gst_num, email, company_name, name, performa_num, leadid, plan_price, contact, id, assigned_id, duration, report_type, payment_status } = userData;
    this.doesUserBelongToDelhi = (address.toLowerCase()).includes("delhi");
    this.address.billing.line1 = address;
    this.leadId = leadid;
    this.gstNum = gst_num;
    this.emailArr = email.split(",");
    this.email = this.emailArr[0];
    this.phone = contact.split(",")[0];
    this.companyName = company_name;
    this.userName = name;
    this.userData = {...userData};
    this.orderNum = performa_num;
    this.tableData.rate = plan_price;
    this.issuedBy = assigned_id;
    this.onlyId = id;
    this.selectedReport = report_type;
    this.tableData.duration = duration;
    this.paymentStatus = payment_status;

    this.doesUserBelongToDelhi = this.gstNum.substring(0, 2)=="07";
    this.onCalculateTax();
    this.labels = ["issued_By", "username", "invoice_Date"];
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
      this.onUpdateInvoiceDetails();
      return;
    }

    const finalStep = (msg:string) => {
      this.isApiInProcess = false;
      this.callback.emit(true);
      this.utility.showToastMsg("success", "SUCCESS", msg);
      this.onDismissModal();
    };
    this.isApiInProcess = true;
    const apiBody = this.setAllRequiredValues();

    const emailObj:any = {userData:apiBody, hasAttachement: this.attachmentType[0] };

    this.apiSubscription1 = this.apiService.addTaxInvoiceLeadAPI(apiBody).subscribe({
      next: (res1:any) => {
        if(!res1.error) {

          this.apiSubscription2 = this.apiService.updateStatusLeadAPI({email: this.userData?.email}).subscribe({
            next: (res2:any) => {
              if(!res2.error) {

                if(this.isMailNeeded=="yes") {
                  if(this.currentStage!="tax") {
                    this.apiSubscription3 = this.apiService.sendInvoiceEmailAPI(emailObj).subscribe({
                      next: (res3:any) => {
                        if(!res3.error) finalStep("Proforma Invoice has been updated to Tax Invoice and Email has been sent successfully.");
                        else this.utility.showToastMsg("error", "ERROR", res3.msg);
                      }, error: (err:any) => console.log(err)
                    });
                  } else finalStep("Tax Invoice has been updated.");
                  
                } else finalStep("Proforma Invoice has been updated to Tax Invoice.");

              } else this.utility.showToastMsg("error", "ERROR", res2.msg);
            }, error: (err:any) => console.log(err)
          });

        } else this.callback.emit(false);
      }, error: (err:any) => console.log(err)
    });
  }

  onSendEmail() {
    const apiBody = this.setAllRequiredValues();
    const emailObj:any = {userData:apiBody, hasAttachement: this.attachmentType[0] };
    this.isApiInProcess = true;

    this.apiSubscription3 = this.apiService.sendTaxInvoiceEmailAPI(emailObj).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.isApiInProcess = false;
          this.utility.showToastMsg("success", "SUCCESS", "Tax Invoice has been sent successfully!");
          this.onDismissModal();
        } else {
          this.isApiInProcess = false;
          this.utility.showToastMsg("error", "ERROR", res.msg);
        }
      }, error: (err:any) => console.log(err)
    });
  }

  onUpdateInvoiceDetails() {
    this.isApiInProcess = true;
    const bodyObj = this.setAllRequiredValues();
    this.apiSubscription5 = this.apiService.updateTaxInvoiceLeadAPI(bodyObj).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.isApiInProcess = false;
          this.utility.showToastMsg("success", "SUCCESS", "Tax Invoice has been updated!");
          this.callback.emit(true);
          this.onDismissModal();
        }
      }, error: (err:any) => console.log(err)
    });
  }

  getAllUser() {
    const userId = this.utility.fetchUserSingleDetail("id");
    this.apiSubscription2 = this.apiService.getAllUsersAPI(userId).subscribe({
      next: (res:any) => {
        if(!res.error) {this.assigneeList = res?.result;}
      }, error: (err:any) => {console.log(err);}
    });
  }

  getCompaniesList() {
    this.apiSubscription6 = this.apiService.getCompaniesListAPI().subscribe({
      next: (res:any) => {
        if(!res?.error) {
          this.companiesList = res?.result;
          this.copyCompaniesList = res?.result;
        }
      }, error: (err:any) => console.log(err)
    });
  }

  onSelectCompany(item:any) { 
    this.choosenCompany.name = this.ellipsesPipe.transform(item?.company_name, 30); 
    this.choosenCompany.id = item?.id; 
    this.visibleDialogue2 = false;
  }
  onSerchCompany() {
    const strLen = this.keyUpCompanyStr.length;
    this.copyCompaniesList = this.companiesList.filter((item:any) => (item["company_name"]).substr(0, strLen).toLowerCase() == this.keyUpCompanyStr.trim().toLowerCase());
  }

  getSingleCompanyDetail() {
    this.isApiInProcess = true;
    const suffixPiNum = `${new Date().getFullYear()}-${`${new Date().getFullYear()+1}`.substring(2, 4)}`;
    this.apiSubscription4 = this.apiService.getSingleCompanyDetailAPI(this.choosenCompany?.id).subscribe({
      next: (res:any) => {
        if(!res?.error) {
          const {company_name, name:clientName, address, gst_num, email, id} = res?.result[0];
          this.companyName = company_name;
          this.userName = clientName;
          this.gstNum = gst_num;
          this.emailArr = email.split(",");
          this.email = this.emailArr[0];
          this.leadId = id;
          this.address.billing.line1 = address; 
          this.userData = JSON.parse(JSON.stringify(res?.result[0]));
          this.taxNum = `${suffixPiNum}EPL${this.taxNum}`;
          
          if(!this.errorTypes.includes(this.gstNum) && this.gstNum.length>=10) {
            this.doesUserBelongToDelhi = this.gstNum.substring(0, 2)=="07";
          } else this.doesUserBelongToDelhi = false;

          this.isApiInProcess = false;
          this.isAddPI = false;
          this.isAddingNewPI = true;
        }
      }, error: (err:any) => console.log(err)
    });
  }

  onBindRestoredData(dataObj:any) {
    const {shipping_add, billing_add, email, contact, CGST_taxPer, SGST_taxPer, IGST_taxPer, company_name, name, gst_num} = dataObj;
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
    this.leadId = dataObj["leadid"];
    this.onlyId = dataObj["id"];
    this.companyName = company_name;
    this.userName = name;
    this.gstNum = gst_num;
    this.emailArr = email.split(",");
    this.email = this.emailArr[0];
    this.phone = contact.split(",")[0];
    this.issuedBy = dataObj["issued_by"];
    this.address.billing = {line1: (billing_add).split("~")[0], line2: (billing_add).split("~")[1]};
    this.doesUserBelongToDelhi = this.gstNum.substring(0, 2)=="07";
    this.taxNum = dataObj["tax_num"];
    this.orderNum = dataObj["performa_num"];
    this.invoiceDate = (dataObj["invoice_date"]).split("T")[0];
    this.bankDetails = {bankName, branch, accountNo, ifsc};
    if(dataObj["shipping_add"]!="") {
      this.isSameAdd = true;
      this.address.shipping = {line1: (shipping_add).split("~")[0], line2: (shipping_add).split("~")[1]};
    }
    this.onCalculateTax();
    this.labels = ["issued_By", "username", "invoice_No", "invoice_Date"];
  }


  setAllRequiredValues():any {
    const {cgst, sgst, igst} = this.tableData.gst;
    const {cgst:cgstAmt, sgst:sgstAmt, igst:igstAmt} = this.tableData.gstAmt;
    return {
      id: this.onlyId,
      leadId: this.leadId,
      userId: this.userData?.user_id || this.utility.fetchUserSingleDetail("id"),
      planName: this.userData?.plan_name || "",
      invoiceDate: this.invoiceDate,
      address: [this.address.shipping, this.address.billing],
      taxNum: this.taxNum,
      performaNum: this.orderNum,
      issuedBy: this.issuedBy,
      reportName: this.selectedReport,
      duration: this.tableData.duration,
      hsnSac: this.tableData.hsnCode,
      qty: this.tableData.qty,
      unit: this.tableData.unit,
      amount: [this.tableData.rate, this.tableData.amount],
      taxAmt: this.tableData.taxable,
      gstTax: {cgst, sgst, igst},
      gstAmt: {cgstAmt, sgstAmt, igstAmt},
      bankData: JSON.stringify(this.bankDetails),
      isEmailSent: this.isMailNeeded=="yes",
      attachment: this.attachmentType,
      paymentStatus: this.paymentStatus.toString(),
      dataType: this.portalDataType,
      clientName: this.userName,
      companyName: this.companyName,
      gstNumber: this.gstNum,
      clientEmail: this.email,
      clientPhone: this.phone,
      currentStage: this.currentStage
    };
  }

  onClickPrint() {
    this.isApiInProcess = true;
    const pdfData = this.setAllRequiredValues();
    console.log(pdfData)
    this.eventService.passPdfData.next(pdfData);
    setTimeout(() => {
      this.isApiInProcess = false;
      this.onDismissModal();
      this.printCallback.emit(true);
    }, 1500);
  }


  onClickAddNewBtn() {
    const suffixPiNum = `${new Date().getFullYear()}-${`${new Date().getFullYear()+1}`.substring(2, 4)}`;
    this.isAddPI = false;
    this.isAddingNewPI = true;
    this.taxNum = `${suffixPiNum}EPL${this.taxNum}`;
  }

  onUpdateInvoice() {
    this.isApiInProcess = true;
    const apiBody = {
      id: this.onlyId,
      rate: this.tableData.rate,
      reportType: this.selectedReport, 
      duration: this.tableData.duration,
      paymentStatus: this.paymentStatus
    };

    this.apiSubscription1 = this.apiService.updateInvoideLeadAPI(apiBody).subscribe({
      next: (res:any) => {
        if(!res?.error) {
          this.isApiInProcess = false;
          this.onDismissModal();
          this.callback.emit(true);
          this.utility.showToastMsg("success", "SUCCESS", "Invoice updated successfully!");
        } else this.utility.showToastMsg("error", "ERROR", res?.msg);
      }, error: (err:any) => console.log(err)
    });
  }


  onClickNewAdd() {
    this.isApiInProcess = true;
    const bodyObj = {
      leadId: this.leadId, 
      gst: this.gstNum, 
      userId: this.utility.fetchUserSingleDetail("id"), 
      assignedFrom: this.utility.fetchUserSingleDetail("id"), 
      plan_price: this.tableData.rate, 
      performa_num: this.orderNum,
      assigningFrom: "addPI",
      reportType: this.selectedReport, 
      duration: this.tableData.duration
    };
    
    this.apiSubscription1 = this.apiService.addInvoiceLeadAPI(bodyObj).subscribe({
      next: (res:any) => {
        if(!res?.error) {
          this.isApiInProcess = false;
          this.onDismissModal();
          this.utility.showToastMsg("success", "SUCCESS", "PI successfully added!");
          this.callback.emit(true);
        } else this.utility.showToastMsg("error", "ERROR", res?.msg);
      }, error: (err:any) => console.log(err)
    })
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