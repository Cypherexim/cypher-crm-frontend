import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy{
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utility: UtilitiesService,
    private eventService: EventsService
  ) {}

  isLoginPage:boolean = false;
  currentUserData:any = {};
  eventSubscription2:Subscription = new Subscription();

  ngOnInit(): void {
    this.router.events.subscribe((res:any) => {
      if(this.route.snapshot.routeConfig?.path == "login") this.isLoginPage = true;
      else {
        this.currentUserData = this.utility.fetchUserDetails();
        this.isLoginPage = false;
      }
    });

    //to alert about login
    this.eventSubscription2 = this.eventService.userLoginEvent.subscribe({
      next: (res:any) => {
        this.utility.showToastMsg("success", "SUCCESS", "Login Successfully😄!");
      }
    });
  }

  onClickLogout() {
    localStorage.setItem("crm_user", "{}");
    location.reload();
  }

  ngOnDestroy(): void {
    this.eventSubscription2.unsubscribe();
  }
}
