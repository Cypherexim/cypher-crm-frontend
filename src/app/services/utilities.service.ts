import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(
    private router: Router,
    private messageService: MessageService
  ) { }

  hasUserLoggedIn() {
    const currentUser = localStorage.getItem("crm_user");

    if(["{}", null, undefined].includes(currentUser)) {
      this.router.navigate(["login"]);
    } else {
      const parsedUser = JSON.parse(currentUser || "{}");
      const currentTime = new Date().toLocaleDateString();
      const loginTime = new Date(parsedUser?.last_login).toLocaleDateString();

      // if(currentTime != loginTime) {
      //   localStorage.setItem("crm_user", "{}");
      //   this.router.navigate(["login"]);
      // }
    }
  }

  fetchUserDetails() {
    const currentUser = localStorage.getItem("crm_user");
    return JSON.parse(currentUser || "{}");
  }

  fetchUserSingleDetail(key:string) {
    const userData = this.fetchUserDetails();
    return userData[key];
  }

  isUserAdmin():boolean {
    const userDetails = this.fetchUserDetails();
    const role = userDetails["role"];
    return role=="admin";
  }

  timeConverter(time:any) {
    // Check correct time format and split into components
    time = time.toString ().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }

  createTimeFormat(dateTime:any=null) {
    const addZero = (digit:number) => digit<10 ? "0"+digit : digit;
    
    const newDate = dateTime!=null ? new Date(dateTime["date"]) : new Date();
    const date = `${addZero(newDate.getFullYear())}-${addZero(newDate.getMonth()+1)}-${addZero(newDate.getDate())}`;
    const time = dateTime!=null 
      ? `${addZero(Number((dateTime["time"]).split(":")[0]))}:${addZero(Number((dateTime["time"]).split(":")[1]))}:00`
      : `${addZero(newDate.getHours())}:${addZero(newDate.getMinutes())}:00`;
      
    return `${date} ${time}`;
  }
  

  setValuesForOpenLead(leadModel:any, followupLeads:any, callBy:string) {
    leadModel.userId = followupLeads["user_id"];
    leadModel.leadId = followupLeads["leadid"];
    leadModel.username = followupLeads["name"];
    leadModel.company = followupLeads["company_name"];
    leadModel.designation = followupLeads["designation"];
    leadModel.department = followupLeads["department"];
    leadModel.address = followupLeads["address"];
    leadModel.location = followupLeads["location"];
    leadModel.email = followupLeads["email"];
    leadModel.contact = followupLeads["contact"];
    leadModel.gst = followupLeads["gst_num"];
    leadModel.pan = followupLeads["pan_num"];
    leadModel.iec = followupLeads["iec_num"];
    leadModel.remark = followupLeads["remarks"];
    leadModel.assignedFrom = followupLeads["assigned_from"];
    leadModel.currentStage = "open";
    leadModel.leadTracker = followupLeads["lead_tracker"];
    leadModel.followupTracker = followupLeads["followup_tracker"];
    leadModel.transTime = new Date().toISOString();
    leadModel.nextFollow = followupLeads["next_followup"];
    leadModel.lastFollow = followupLeads["last_followup"];
    // if(["login","lead","leadEdit-open"].includes(callBy)) { //while login and restore
    // }

    // //for all such as demo, pricing, invoice
    // if(callBy=="leadEdit") { 
    //   leadModel.nextFollow = "";
    //   if(leadModel.followupTracker != "") {
    //     const parsedArr = JSON.parse(leadModel.followupTracker);
    //     leadModel.lastFollow = parsedArr[0]["date"];      
    //   } else { leadModel.lastFollow = ""; }
    // }

    return leadModel;
  }


  showToastMsg(severity:string, summary:string, detail:string) {
    const toastData = { severity, summary, detail };
    this.messageService.add(toastData);
  }
}
