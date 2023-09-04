import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CSVModel } from 'src/app/models/excelModel';
import { ApiService } from 'src/app/services/api.service';
import { EventsService } from 'src/app/services/events.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-lead-add',
  templateUrl: './lead-add.component.html',
  styleUrls: ['./lead-add.component.scss']
})
export class LeadAddComponent implements OnInit, OnDestroy {
  constructor(
    private activeModal: NgbActiveModal,
    private apiService: ApiService,
    private utility: UtilitiesService,
    private eventService: EventsService
  ) {}
 
  addLeadValues:CSVModel = new CSVModel();
  apiSubscription:Subscription = new Subscription();
  eventSubscription:Subscription = new Subscription();
  existingEmails:string[] = [];
  isBtnClicked:boolean = false;

  ngOnInit(): void {
    this.eventSubscription = this.eventService.passExistingEmails.subscribe({
      next: (res:any) => { this.existingEmails = res; }, 
      error: (err:any) => { console.log(err); }
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
    this.apiSubscription.unsubscribe();
  }

  onDismissModal = () => this.activeModal.dismiss('Cross click');

  onSubmit() {
    this.isBtnClicked = true;
    if(this.existingEmails.includes(this.addLeadValues.email)) {
      this.isBtnClicked = false;
      this.utility.showToastMsg("error", "Email Exist", "Email is already exist!");
      return;
    }

    this.addLeadValues.currentStage = "open";
    this.addLeadValues.userId = this.utility.fetchUserSingleDetail("id");
    this.addLeadValues.transTime = this.utility.createTimeFormat();

    this.apiSubscription = this.apiService.addSingleOpenLeadAPI(this.addLeadValues).subscribe({
      next: (res:any) => {
        if(!res?.err) {
          console.log(res?.msg);
          this.isBtnClicked = false;
          this.onDismissModal();
          this.eventService.onCompleteInsertion.next("Inserted");
          this.utility.showToastMsg("success", "SUCCESS", "Leads are inserted successfully!");
        }
      },
      error: (err:any) => {console.log(err)}
    });
  }
}
