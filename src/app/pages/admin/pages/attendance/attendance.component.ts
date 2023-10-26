import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  constructor(
    private eventService: EventsService,
    private apiService: ApiService
  ) {}

  eventSubscription1:Subscription = new Subscription();
  assigneeList:any[] = [];
  tableHeads:string[] = ["S. No.", "Date", "Name", "User ID", "Login Time", "Logout Time", "Total Minutes"];
  apiBody = { userId: "", from: "", to: "" };
  attendanceData:any[] = [];

  ngOnInit(): void {
    this.getAllUser();
  }

  getAllUser() {
    this.eventSubscription1 = this.eventService.allUserDataEmit.subscribe({
      next: (res:any) => this.assigneeList = res,
      error: (err:any) => console.log(err)
    });
  }

  onSearchUserAttendance() {
    this.apiService.getUserAttendanceAPI(this.apiBody).subscribe({
      next: (res:any) => {
        if(!res.error) this.attendanceData = res?.result;
      },
      error: (err:any) => console.log(err)
    });
  }
}
