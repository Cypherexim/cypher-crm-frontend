import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor() { }

  onCompleteInsertion:Subject<any> = new Subject<any>();
  passExistingEmails:Subject<any[]> = new BehaviorSubject<any[]>([]);
  userLoginEvent:Subject<boolean> = new Subject<boolean>();
}
