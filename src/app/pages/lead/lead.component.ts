import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LeadEditComponent } from 'src/app/modals/lead-edit/lead-edit.component';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { LeadModel } from 'src/app/models/leadModel';
import { EllipsisPipe } from 'src/app/common/ellipsis.pipe';
import { EventsService } from 'src/app/services/events.service';
import { CSVModel } from 'src/app/models/excelModel';
import { LeadInvoiceComponent } from 'src/app/modals/lead-invoice/lead-invoice.component';

@Component({
  selector: 'app-lead',
  templateUrl: './lead.component.html',
  styleUrls: ['./lead.component.scss']
})
export class LeadComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router,
    private utility: UtilitiesService,
    private apiService: ApiService,
    private datepipe: DatePipe,
    private titlecasepipe: TitleCasePipe,
    private ellipsespipe: EllipsisPipe,
    private eventService: EventsService
  ) { this.urlDetectionEvent(); }

  apiSubscription1:Subscription = new Subscription();
  apiSubscription2:Subscription = new Subscription();
  apiSubscription3:Subscription = new Subscription();
  eventSubscription1:Subscription = new Subscription();
  eventSubscription2:Subscription = new Subscription();
  eventSubscription3:Subscription = new Subscription();

  
  leadData:any = {};
  tableHeads = new LeadModel().getCurrentKeys("open");
  excelModelVal:CSVModel = new CSVModel();
  currentStage:string = "";
  isApiInProcess:boolean = false;
  isButtonClicked:boolean = false;
  taxNum:string = "";
  piNum:number = 0;
  tdModalType:string = "last_followup";
  
  leadList:any[] = [];
  copyLeadList:any[] = [];

  visibleDialogue:boolean = false;
  visibleDialogue2:boolean = false;
  followUpHistory:any[] = [];
  
  conditionalStages:string[] = ["status"];
  titleCondition:string[] = ["tax", "invoice"];
  sourceList:string[] = ["database", "linkedin", "exhibition", "reference", "website", "online lead"];
  errorTypes:any[] = ["", "null", null, "undefined", undefined];
  popupTitles:any = {
    last_followup: "Last Follow-ups",
    contact: "Contact List",
    email: "Email List"
  };


  urlDetectionEvent() {
    this.eventSubscription1 = this.router.events.subscribe((res:any) => {
      if(res instanceof NavigationEnd) { 
        this.currentStage = this.route.snapshot.paramMap.get("stage") || "";
        this.tableHeads = new LeadModel().getCurrentKeys(this.currentStage);

        if(this.apiSubscription1) this.apiSubscription1.unsubscribe();
        this.getAllOpenLeads(this.currentStage);
      }
    }); 
  }

  ngOnInit(): void {
    this.eventSubscription2 = this.eventService.onCompleteInsertion.subscribe({
      next: (res:any) => {
        if(res == "Inserted") this.refreshPage();
        this.tableHeads = new LeadModel().getCurrentKeys(this.currentStage);
      }
    });

    this.fetchInvoiceNumber();
  }

  ngOnDestroy(): void {
    this.eventSubscription1.unsubscribe();
    this.eventSubscription2.unsubscribe();
    this.eventSubscription3.unsubscribe();
    this.apiSubscription1.unsubscribe();
    this.apiSubscription2.unsubscribe();
    this.apiSubscription3.unsubscribe();
  }

  fetchInvoiceNumber() {
    this.apiSubscription1 = this.apiService.getInvoiceNumAPI().subscribe({
      next: (res:any) => {
        if(!res?.error) {
          this.taxNum = res?.result[0]?.PI_num;
          this.piNum = res?.result[0]?.order_num;
        }
      }, error: (err:any) => {console.log(err);}
    });
  }

  getAllOpenLeads(stageType:string) {
    this.leadList = [];
    this.copyLeadList = [];
    this.isApiInProcess = true;
    const userId = this.utility.fetchUserSingleDetail("id");
    const leadTypeAPI:any = {
      "open": this.apiService.getAllOpenLeadsAPI(userId),
      "close": this.apiService.getAllCloseLeadsAPI(userId),
      "follow-up": this.apiService.getAllFollowupLeadsAPI(userId),
      "reject": this.apiService.getAllRejectLeadsAPI(userId),
      "demo": this.apiService.getAllDemoLeadsAPI(userId),
      "price": this.apiService.getAllPriceLeadsAPI(userId),
      "status": this.apiService.getAllStatusLeadsAPI(userId),
      "invoice": this.apiService.getAllInvoiceLeadsAPI(userId),
      "tax": this.apiService.getAllTaxInvoiceLeadsAPI(userId)
    }

    if(!leadTypeAPI.hasOwnProperty(stageType)) return;

    this.apiSubscription1 = (leadTypeAPI[stageType]).subscribe({
      next: (res:any) => {
        this.leadList = res?.result;
        this.copyLeadList = res?.result;
        this.isApiInProcess = false;
        
        if(stageType=="open") {
          const emailList:any[] = [];
          this.leadList.forEach((item:any, index:number) => {
            emailList.push(item["email"]);
            if(index==this.leadList.length-1) this.eventService.passExistingEmails.next(emailList);
          });          
        } else if(stageType=="status") this.loopOutJsonLeads(res?.result, "status");
        // else if(stageType=="tax") this.loopOutJsonLeads(res?.result, "tax");
      },
      error: (err:any) => {console.log(err);}
    });
  }

  loopOutJsonLeads(dataList:any[], stageType:string) {
    this.leadList = [];
    this.copyLeadList = [];
    for(let i=0; i<dataList.length; i++) {
      const leadData = dataList[i]["lead_data"];
      const parsedJSON = JSON.parse(leadData);
      this.leadList.push({...dataList[i], ...parsedJSON});
    }
    this.copyLeadList = JSON.parse(JSON.stringify(this.leadList));
  }

  setTableValues(data:any, key:string) {
    const dateKeys = ["last_followup", "next_followup", "transaction_time", "demo_time", "invoice_date"];

    if(this.errorTypes.includes(data[key])) return "N/A";
    else if(dateKeys.includes(key)) {
      const dateTime = (data[key]).replace(new RegExp("NaN", "g"), "00");
      return this.datepipe.transform(dateTime, key=="invoice_date"?"MMM d, y":"MMM d, y, h:mm:ss a");
    }
    else if(["email", "contact", "address"].includes(key)) {
      const modifiedStr = (<string>data[key]).replace(new RegExp(",", "g"), ", ");
      if(["email", "contact"].includes(key)) return this.toTitleCase(this.titlecasepipe.transform(modifiedStr.split(",")[0]));
      return this.titlecasepipe.transform(modifiedStr);
    } else if(key == "remarks") return this.ellipsespipe.transform(data[key], 35);
    else if(key == "assigned_from") return this.toTitleCase(this.utility.fetchUserSingleDetail("id")==data["assigend_from_id"] ? "self" : data[key]);
    else return data[key]=="N/A" ? data[key] : this.titlecasepipe.transform(`${data[key]}`);
  }

  refreshPage() {
    const selectTag = document.getElementById("sourceId") as HTMLSelectElement;
    if(selectTag) selectTag.value = "";
    this.getAllOpenLeads(this.currentStage);
  }

  openEditModal(itemData:any) {
    const modalRef = this.modalService.open(LeadEditComponent, { windowClass: 'leadEditModalCss' });
    (<LeadEditComponent>modalRef.componentInstance).currentLeadPage = this.currentStage;
    (<LeadEditComponent>modalRef.componentInstance).onBindLeadData(itemData);
    (<LeadEditComponent>modalRef.componentInstance).piNum = this.piNum;
    const eventRef = (<LeadEditComponent>modalRef.componentInstance).callback.subscribe((res:any) => {
      if(res.isMsg) {
        const response = (<string>res.msg).toLowerCase();
        const flags = ["insert", "update", "delete"].filter((item:string) => response.includes(item));
        if(flags.length>0) this.refreshPage();
      } else { 
        this.updateInvoiceTracker("order_num"); 
        this.refreshPage();
      }
      eventRef.unsubscribe();
    });
  }

  openInvoiceModal(itemData:any) {
    const suffixPiNum = `${new Date().getFullYear()}-${`${new Date().getFullYear()+1}`.substring(2, 4)}`;
    const modalRef = this.modalService.open(LeadInvoiceComponent, { backdrop: "static", keyboard: false, windowClass: 'leadAddModalCss3' });
    (<LeadInvoiceComponent>modalRef.componentInstance).currentStage = this.currentStage;
    if(this.currentStage == "invoice") {
      (<LeadInvoiceComponent>modalRef.componentInstance).onBindUserData(itemData);
      (<LeadInvoiceComponent>modalRef.componentInstance).taxNum = `${suffixPiNum}EPL${this.taxNum}`;
    } else (<LeadInvoiceComponent>modalRef.componentInstance).onBindRestoredData(itemData);

    const modalSubs = (<LeadInvoiceComponent>modalRef.componentInstance).callback.subscribe({
      next: (res:any) => {
        if(res) {
          this.apiSubscription2 = this.apiService.allDeleteAPIs(itemData["leadid"], itemData["user_id"], "Invoice").subscribe({
            next: (res:any) => {
              this.refreshPage();
              this.updateInvoiceTracker("PI_num");
            }, error: (err:any) => console.log(err)
          });
        }
        modalSubs.unsubscribe();
      }
    });
  }

  updateInvoiceTracker(colName:string) {
    this.apiSubscription3 = this.apiService.updateInvoiceNumAPI(colName).subscribe({next: (res:any) => {
      this.fetchInvoiceNumber();
      console.log("Invoice Number updated!");
    }});
  }

  showDialog(itemVal:string, colType:string) {
    if(colType=="last_followup" && itemVal!="") {
      this.followUpHistory = JSON.parse(itemVal);
    } else if(["contact","email"].includes(colType)) {
      this.followUpHistory = itemVal.split(",");
    }
    this.tdModalType = colType;
    this.visibleDialogue = true;
  }

  showDialog2(itemData:any) {
    this.visibleDialogue2 = true;
    this.leadData = itemData;
  }

  restoreLeadToOpen() {
    this.excelModelVal = this.utility.setValuesForOpenLead(this.excelModelVal, this.leadData, "lead");
    this.isButtonClicked = true;
    this.apiService.revertToOpenLeadAPI(this.excelModelVal).subscribe({
      next: (res:any) => {
        if(!res.error) {
          const leadType = this.currentStage.replace(new RegExp(" ", "g"), "");
          this.apiService.allDeleteAPIs(this.leadData.id, this.leadData.user_id, leadType).subscribe({
            next: (res2:any) => {
              if(!res2.error) {
                this.visibleDialogue2 = false;
                this.isButtonClicked = false;
                this.refreshPage();
              }
            }, error: (err:any) => {console.log(err);}
          });
        }
      }, error: (err:any) => {console.log(err);}
    });
  }

  isFollowedUp(item:any):string {
    // if(this.currentStage=="open") {
    //   const hasFollowupData = item["followup_tracker"];
    //   const hasRemark = item["remarks"];
    //   return (hasFollowupData!="" && hasRemark!="")?"followed-up":"";
    // } else return "";
    return "";
  }

  // followupCond(item:any):boolean {
  //   return item.key=="last_followup"; //(item.key=='email' && this.currentStage=="open");
  // }

  onFilterLead(e:any) {this.copyLeadList = e;}

  onChangeSource(e:any) {
    const value = e.target.value;
    if(value == "") {this.copyLeadList = JSON.parse(JSON.stringify(this.leadList));}
    else {this.copyLeadList = this.leadList.filter((item:any) => item["source"]==value);}
  }

  checkInfoAvailability(listStr:string):boolean {
    return !this.errorTypes.includes(listStr) && listStr.split(",").length>1;
  }

  toTitleCase(str:string) {return str[0].toUpperCase() + str.substring(1, str.length);}
  doesFollowupExist(followupStr:string|any):boolean {
    if(this.errorTypes.includes(followupStr)) return false;
    else {
      debugger
      return true;
    }
  }
}
