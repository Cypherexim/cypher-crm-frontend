import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  constructor() {}

  isRouterActivate:boolean = false;

  adminOptions:any[] = [
    {
      lable: "Users Attendance",
      path: "attendance",
      title: "To see all users attendance as per daily basis",
      isDisable: false
    },
    {
      lable: "Add New User",
      path: "add/user",
      title: "To add new user for the CRM",
      isDisable: true
    }
  ];

  onActivateRouter(e:any) {
    if(!(e instanceof AdminComponent)) {
      this.isRouterActivate = true;
    }
  }

  onDeactivateRouter() {
    this.isRouterActivate = false;
  }
}
