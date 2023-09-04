import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CsvParserService } from 'src/app/services/csv-parser.service';
import { EventsService } from 'src/app/services/events.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-lead-file',
  templateUrl: './lead-file.component.html',
  styleUrls: ['./lead-file.component.scss']
})
export class LeadFileComponent implements OnInit, OnDestroy{
  constructor(
    private csvparser: CsvParserService,
    private apiService: ApiService,
    private activeModal: NgbActiveModal,
    private eventService: EventsService,
    private utility: UtilitiesService
  ) {}

  apiSubscription1:Subscription = new Subscription();
  eventSubscription1:Subscription = new Subscription();

  acceptExcelFormats:string = ".csv";//, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
  existingEmails:string[] = [];
  isApiInProcess:boolean = false;
  fileInpVal:any;
  fileName:string = "Choose file";

  ngOnInit(): void {
    this.eventSubscription1 = this.eventService.passExistingEmails.subscribe({
      next: (res:any) => { this.existingEmails = res; }, 
      error: (err:any) => { console.log(err); }
    });
  }

  openExcelFileInp(fileElem:HTMLInputElement) {fileElem.click();}

  onDismissModal = () => this.activeModal.dismiss('Cross click');

  onSelectFile(event:any) {
    this.fileInpVal = event.target;
    this.fileName = this.fileInpVal.files[0].name;
  }

  onSubmit() {
    this.csvparser.convertIntoJson(this.fileInpVal, (err:any, csvRecords:any) => {
      if(!err) {
        const filteredCsvRecords = csvRecords.filter((item:any) => !this.existingEmails.includes(item["email"]));

        if(filteredCsvRecords.length==0) {
          this.utility.showToastMsg("error", "Exist Email", "All emails are already exist!");
          return;
        }

        this.isApiInProcess = true;
        const apiBody = { excelJson: JSON.stringify(filteredCsvRecords) };
        this.apiSubscription1 = this.apiService.addMultiOpenLeadAPI(apiBody).subscribe({
          next: (res:any) => {
            this.onDismissModal();
            this.isApiInProcess = false;
            this.eventService.onCompleteInsertion.next("Inserted");
            this.utility.showToastMsg("success", "SUCCESS", "Leads are inserted successfully!");
          }, error: (err:any) => { console.log(err); }
        });
      } else console.log(err);
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription1.unsubscribe();
    this.apiSubscription1.unsubscribe();
  }
}
