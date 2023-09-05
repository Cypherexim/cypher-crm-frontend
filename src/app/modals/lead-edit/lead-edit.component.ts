import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { CSVModel } from 'src/app/models/excelModel';
import { LeadModel } from 'src/app/models/leadModel';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-lead-edit',
  templateUrl: './lead-edit.component.html',
  styleUrls: ['./lead-edit.component.scss']
})
export class LeadEditComponent implements OnDestroy, OnInit{
  constructor(
    public activeModal: NgbActiveModal,
    private utility: UtilitiesService,
    private datepipe: DatePipe,
    private titlecasepipe: TitleCasePipe,
    private apiService: ApiService
  ) {}

  @Output() callback:EventEmitter<any> = new EventEmitter<any>();
  apiSubscription1:Subscription = new Subscription();
  apiSubscription2:Subscription = new Subscription();
  apiSubscription3:Subscription = new Subscription();
  apiSubscription4:Subscription = new Subscription();

  isNotEditMode:boolean = true;
  tableHeads:string[] = [];
  statusOptions:any[] = [
    {label: "Today Followup", id:"open"}, 
    {label: "Next Followup", id:"follow-up"},
    {label: "Demo", id:"demo"},
    {label: "Pricing", id:"pricing"},
    {label: "Invoice", id:"invoice"},
    {label: "Reject", id:"reject"},
  ];
  assigneeList:any[] = [];
  isSeeMoreClicked:boolean = false;
  isSubmitClicked:boolean = false;
  currentLeadPage:string = "";
  currentLeadStatus:string = "";
  gstNum:string = "";
  planName:string = "";
  planPrice:string = "";
  piNum:number = 0;

  leadData:any = {};
  tempLeadData:any = {};
  excelModelVal:CSVModel = new CSVModel();
  // submitExcelModelVal:CSVModel = new CSVModel();
  leadModelArr = new LeadModel().leadUserKeys;

  updatedRemark:string = "";
  dateTime = {date: "", time: ""};
  assignedUser:string|number = "";

  ngOnInit(): void {
    if(this.currentLeadPage!="demo") this.leadModelArr.shift();
    this.getAllUser();
  }
  
  getAllUser() {
    const userId = this.utility.fetchUserSingleDetail("id");
    this.apiService.getAllUsersAPI(userId).subscribe({
      next: (res:any) => {
        if(!res.error) {this.assigneeList = res?.result;}
      }, error: (err:any) => {console.log(err);}
    });
  }

  getSingleUser = (id:number) => this.assigneeList.filter((item:any) => item["id"] == id);

  onBindLeadData(itemData:any) {
    this.leadData = {...itemData};
    this.tempLeadData = {...itemData};
    
    this.tempLeadData["email"] = (<string>this.tempLeadData["email"]).split(",")[0];//temporarily
    this.tempLeadData["contact"] = (<string>this.tempLeadData["contact"]).split(",")[0];//temporarily
    this.tempLeadData["address"] = (<string>this.tempLeadData["address"]).replace(new RegExp(",", "g"), ", ");
    this.tempLeadData["transaction_time"] = this.datepipe.transform(this.tempLeadData["transaction_time"], "MMM d, y, h:mm:ss a");
    if(this.currentLeadPage=="demo") {
      this.tempLeadData["demo_time"] = this.datepipe.transform(this.tempLeadData["demo_time"], "MMM d, y, h:mm:ss a");
    }
    
    this.excelModelVal.username = this.leadData["name"];
    this.excelModelVal.contact = (this.leadData["contact"]).split(",")[0];//temporarily
    this.excelModelVal.email = (this.leadData["email"]).split(",")[0];//temporarily
    this.excelModelVal.company = this.leadData["company_name"];
    this.excelModelVal.designation = this.leadData["designation"];
    this.excelModelVal.department = this.leadData["department"];
    this.excelModelVal.address = this.leadData["address"];
    this.excelModelVal.location = this.leadData["location"];
    this.excelModelVal.gst = this.leadData["gst_num"];
    this.excelModelVal.pan = this.leadData["pan_num"];
    this.excelModelVal.iec = this.leadData["iec_num"];
    this.excelModelVal.lastFollow = this.leadData["last_followup"];
    this.excelModelVal.nextFollow = this.leadData["next_followup"];
    this.excelModelVal.followupTracker = this.leadData["followup_tracker"];
    this.excelModelVal.remark = this.leadData["remarks"];
    this.excelModelVal.source = this.leadData["source"];
    this.excelModelVal.currentStage = this.currentLeadPage;
    this.excelModelVal.userId = this.utility.fetchUserSingleDetail("id");
    this.excelModelVal.leadId = this.leadData["leadid"];
    this.gstNum = this.leadData["gst_num"];
  }

  onClickEdit() {
    if(this.utility.isUserAdmin()) {
      this.isNotEditMode = !this.isNotEditMode;
      this.isSeeMoreClicked = false;
    }
  }

  //to update existing user data which is shown on the left side of lead edit modal
  onClickUpdate() {
    const apiBody = {
      ...this.excelModelVal,
      id: this.leadData["id"],
      transTime: this.utility.createTimeFormat()
    };

    const leadType = this.excelModelVal.currentStage.replace(" ", "");
    this.isSubmitClicked = true;
    this.apiSubscription1 = this.apiService.updateSingleLeadAPI(apiBody, leadType).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.isSubmitClicked = false;
          this.onDismissModal();
          this.utility.showToastMsg("success", "SUCCESS", `Lead Updated Successfully!`);
          this.callback.emit({msg: res?.msg, isMsg: true});
        }
      },
      error: (err:any) => {console.log(err);}
    })
  }

  onSubmitLead() {
    this.isSubmitClicked = true;
    // this.prevLeadStatus = this.leadData["current_stage"];
    this.excelModelVal.currentStage = this.currentLeadStatus;
    this.excelModelVal.transTime = this.utility.createTimeFormat();
    this.excelModelVal.remark = this.updatedRemark;

    if(this.currentLeadStatus=="follow-up") this.addToFollowupLead();
    else if(this.currentLeadStatus=="reject") this.addToRejectLead();
    else if(this.currentLeadStatus=="open") this.addToOpenLead();
    else if(this.currentLeadStatus=="demo") this.addToDemoLead();
    else if(this.currentLeadStatus=="pricing") this.addToPricingLead();
    else if(this.currentLeadStatus=="invoice") this.addToInvoiceLead();
  }

  onDismissModal = () => this.activeModal.dismiss('Cross click');

  ngOnDestroy(): void {
    this.apiSubscription1.unsubscribe();
    this.apiSubscription2.unsubscribe();
    this.apiSubscription3.unsubscribe();
    this.apiSubscription4.unsubscribe();
  }

  addToRejectLead() {
    const apiBody = {...this.excelModelVal};

    this.apiSubscription2 = this.apiService.addRejectLeadAPI(apiBody).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.deleteAnyTypeLead();
          this.utility.showToastMsg("success", "SUCCESS", `Reject Lead Added successfully!`);
        }
      },
      error: (err:any) => {console.log(err);}
    });
  }

  addToFollowupLead() {
    const tempDate = this.utility.createTimeFormat(this.dateTime);
    // this.excelModelVal.lastFollow = this.leadData["next_followup"];
    this.excelModelVal.nextFollow = tempDate;

    const parsedObj = <any[]>JSON.parse(this.leadData["followup_tracker"] || "[]");
    parsedObj.unshift({ date: tempDate, remark: this.updatedRemark });
    this.excelModelVal.followupTracker = JSON.stringify(parsedObj);

    const apiBody = {...this.excelModelVal, id: this.leadData.id};

    if(this.areDatesSame(this.excelModelVal.nextFollow)) {
      debugger
      this.apiSubscription2 = this.apiService.updateFollowupLeadAPI(apiBody, "Open").subscribe({
        next: (res:any) => {
          this.isSubmitClicked = false;
          this.callback.emit({msg: res?.msg, isMsg: true});
          this.onDismissModal();
          this.utility.showToastMsg("success", "SUCCESS", `Follow-up Lead Added successfully!`);
        },
        error: (err:any) => console.log(err)
      });
    } else {
      this.apiSubscription2 = this.apiService.addFollowupLeadAPI(apiBody).subscribe({
        next: (res:any) => {
          if(!res.error) {
            this.deleteAnyTypeLead();
            this.utility.showToastMsg("success", "SUCCESS", `Follow-up Lead Added successfully!`);
          }
        },
        error: (err:any) => {console.log(err);}
      });
    }
  }

  //especially it is used to restoring again from reject list
  addToOpenLead() {
    this.excelModelVal = this.utility.setValuesForOpenLead(this.excelModelVal, this.leadData);
    this.excelModelVal.remark = this.updatedRemark;

    this.apiSubscription2 = this.apiService.addSingleOpenLeadAPI(this.excelModelVal).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.deleteAnyTypeLead();
          this.utility.showToastMsg("success", "SUCCESS", `Open Lead Added successfully!`);
        }
      },
      error: (err:any) => {console.log(err);}
    });
  }

  addToDemoLead() {
    this.setPreRequesetsForLeadMovement();
    this.excelModelVal.demoTime = this.utility.createTimeFormat(this.dateTime);
    
    this.apiSubscription2 = this.apiService.addDemoLeadAPI(this.excelModelVal).subscribe({
      next: async (res:any) => {
        if(!res.error) {
          await this.addToStatusLead("demo");
          this.deleteAnyTypeLead();
          const username = (this.getSingleUser(Number(this.assignedUser))[0]["name"]).toUpperCase();
          this.utility.showToastMsg("success", "SUCCESS", `Lead assigned to ${username} successfully!`);
        }
      }, error: (err:any) => {console.log(err);}
    });
  }

  addToPricingLead() {
    this.setPreRequesetsForLeadMovement();

    this.apiSubscription2 = this.apiService.addPriceLeadAPI(this.excelModelVal).subscribe({
      next: async(res:any) => {
        if(!res.error) {
          await this.addToStatusLead("price");
          this.deleteAnyTypeLead();
          const username = (this.getSingleUser(Number(this.assignedUser))[0]["name"]).toUpperCase();
          this.utility.showToastMsg("success", "SUCCESS", `Lead assigned to ${username} successfully!`);
        }
      }, error: (err:any) => {console.log(err);}
    });
  }

  
  addToInvoiceLead() {
    this.setPreRequesetsForLeadMovement();
    this.excelModelVal.plan_name = this.planName;
    this.excelModelVal.plan_price = this.planPrice;
    this.excelModelVal.gst = this.gstNum;
    this.excelModelVal.performa_num = this.piNum;

    this.apiSubscription2 = this.apiService.addInvoiceLeadAPI(this.excelModelVal).subscribe({
      next: async(res:any) => {
        await this.addToStatusLead("invoice");
        this.deleteAnyTypeLead();
        const username = (this.getSingleUser(Number(this.assignedUser))[0]["name"]).toUpperCase();
        this.utility.showToastMsg("success", "SUCCESS", `Lead assigned to ${username} successfully!`);
        this.callback.emit({msg: res?.msg, isMsg: false});
      }, error: (err:any) => {}
    });
  }


  async addToStatusLead(currentLeadType:string) {
    const bodyObj = {
      leadData: JSON.stringify(this.excelModelVal),
      assigner: this.utility.fetchUserSingleDetail("id"),
      status: currentLeadType=="invoice"? "performa invoice": currentLeadType
    };
    this.apiSubscription4 = this.apiService.addStatusLeadAPI(bodyObj).subscribe({
      next: (res:any) => {
        if(!res.error) {console.log(res?.msg);}
      }, error: (err:any) => {console.log(err);}
    });
  }


  deleteAnyTypeLead() {
    const leadType = this.titlecasepipe.transform(this.currentLeadPage.replace(" ", ""));
    this.apiSubscription3 = this.apiService.allDeleteAPIs(this.leadData.id, this.leadData.user_id, leadType).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.isSubmitClicked = false;
          this.callback.emit({msg: res?.msg, isMsg: true});
          this.onDismissModal();
        }
      },
      error: (err:any) => {console.log(err);}
    });
  }

  setPreRequesetsForLeadMovement() {
    this.excelModelVal = this.utility.setValuesForOpenLead(this.excelModelVal, this.leadData);
    this.excelModelVal.remark = this.updatedRemark;
    this.excelModelVal.userId = this.assignedUser;
    this.excelModelVal.currentStage = this.currentLeadPage;
    this.excelModelVal.assignedFrom = this.utility.fetchUserSingleDetail("id");
    const parsedJson = JSON.parse(this.excelModelVal.leadTracker || "[]");
    parsedJson.unshift({
      time: this.utility.createTimeFormat(),
      assignedUser: Number(this.assignedUser),
      assignedFrom: this.utility.fetchUserSingleDetail("id"),
      remark: this.updatedRemark
    });
    this.excelModelVal.leadTracker = JSON.stringify(parsedJson);
  }

  onSelectEditStatus() {
    if(this.currentLeadStatus == this.currentLeadPage) {
      this.updatedRemark = this.excelModelVal.remark;
      if(this.currentLeadStatus=="follow-up") {
        const latestFollowup = this.excelModelVal.nextFollow;
        const modifiedTime = (<string>latestFollowup).split(" ")[1];
        this.dateTime.date = (<string>latestFollowup).split(" ")[0];
        this.dateTime.time = modifiedTime.substring(0, modifiedTime.length-3);
      }
    }
  }


  onUpdateLead() {
    this.isSubmitClicked = true;
    const bodyObj:any = {
      id: this.leadData["id"],
      remark: this.updatedRemark
    };
    const isFollowUp = this.currentLeadStatus=="follow-up";
    
    if(isFollowUp) {bodyObj["dateTime"] = `${this.dateTime.date} ${this.dateTime.time}:00`;} 
    else {bodyObj["tableType"] = this.currentLeadStatus.replace("-", "");}

    this.apiSubscription1 = (isFollowUp 
      ? this.apiService.updateFollowupLeadAPI(bodyObj)
      : this.apiService.updateLeadRemarkAPI(bodyObj)
    ).subscribe({
      next: (res:any) => {
        this.isSubmitClicked = false;
        this.callback.emit({msg: res?.msg, isMsg: true});
        this.onDismissModal();
        this.utility.showToastMsg("success", "SUCCESS", `Lead updated successfully!`);
      }, error: (err:any) => console.log(err)
    });
  }

  areDatesSame(givenDate:string):boolean {
    const lastDate = new Date(givenDate.split(" ")[0]);
    const todayDate = new Date();

    const isDaySame = lastDate.getDate() == todayDate.getDate();
    const isMonthSame = lastDate.getMonth() == todayDate.getMonth();
    const isYearSame = lastDate.getFullYear() == todayDate.getFullYear();

    return (isDaySame && isMonthSame && isYearSame);
  }
}



