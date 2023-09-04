import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(
    private utils: UtilitiesService
  ) {}

  ngOnInit(): void {
    this.utils.hasUserLoggedIn();
  }
}
