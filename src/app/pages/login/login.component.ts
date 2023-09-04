import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CSVModel } from 'src/app/models/excelModel';
import { ApiService } from 'src/app/services/api.service';
import { EventsService } from 'src/app/services/events.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  constructor(
    private router: Router,
    private apiService: ApiService,
    private utility: UtilitiesService,
    private eventService: EventsService
  ) {}

  loginBody = {username: "", password: ""};
  loginBtn:string = "login";

  leadDataBody:CSVModel = new CSVModel();

  ngOnInit(): void {}

  onLoginSubmit() {
    this.loginBtn = 'logging in...';
    this.apiService.loginApi(this.loginBody).subscribe({
      next: (res:any) => {
        if(!res.error) {
          this.loginBtn = 'login';
          this.router.navigate(["/home"]);
          localStorage.setItem("crm_user", JSON.stringify(res.result[0]));
          this.followupLeadsDeadLineCheckup(); //checks if followup leads are for today
          setTimeout(() => this.eventService.userLoginEvent.next(true), 100);
        } else alert(res.msg);
      },
      error: (err:any) => {
        this.loginBtn = 'login';
        alert(err["error"]["msg"])
      }
    })
  }

  followupLeadsDeadLineCheckup() {
    const userId = this.utility.fetchUserSingleDetail("id");
    this.apiService.getAllFollowupLeadsAPI(userId).subscribe({
      next: async(res:any) => {
        if(!res.error) {
          const followupLeads = <any[]>res?.result;
          if(followupLeads.length > 0) {
            for(let i=0; i<followupLeads.length; i++) {
              const leadDate = followupLeads[i]["next_followup"];
              const dates = [new Date().toLocaleDateString(), new Date(leadDate).toLocaleDateString()];
              
              if(dates[0] == dates[1]) {
                this.leadDataBody = await this.utility.setValuesForOpenLead(this.leadDataBody, followupLeads[i]);
              
                await this.insertFollowupToOpenLead(this.leadDataBody);
                await this.deleteFollowupLead({
                  id: followupLeads[i]["id"],
                  leadId: followupLeads[i]["leadid"],
                  userId: followupLeads[i]["user_id"]
                });
              }
            }
          }
        }
      },
      error: (err:any) => {}
    });
  }

  async insertFollowupToOpenLead(apiBody:any) {
    this.apiService.revertToOpenLeadAPI(apiBody).subscribe({
      next: (res:any) => {
        if(!res?.error) console.log("Inserted Followup to Open Lead!");
      },
      error: (err:any) => {}
    });
  }

  async deleteFollowupLead(bodyObj:any) {
    console.log(bodyObj)
     this.apiService.deleteFollowupLeadAPI(bodyObj).subscribe({
      next: (res:any) => {
        if(!res?.error) console.log("Deleted successfully!");
      },
      error: (err:any) => {console.log(err);}
    })
  }
}
