import { Routes } from '@angular/router';
import { ChefRentalComponent } from './pages/chef-rental/chef-rental.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Gourmet Moments' },
  { path: 'seferek', component: ChefRentalComponent, title: 'Séf Bérlés – Gourmet Moments' },
  { path: '**', redirectTo: '' },
];
