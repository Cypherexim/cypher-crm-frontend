import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SharedComponent } from './pages/shared/shared.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LeadComponent } from './pages/lead/lead.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  {path: "login", component:LoginComponent},
  {path:"", component:SharedComponent, children: [
    {path: "home", component:HomeComponent},
    {path: "admin", component:AdminComponent},
    {path: "lead/:stage", component:LeadComponent},
    {path: "lead/invoice/:stage", component:LeadComponent},
    {path: "", redirectTo: "home", pathMatch: "full"},
    {path: "**", component: PageNotFoundComponent}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
