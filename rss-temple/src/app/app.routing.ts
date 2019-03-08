import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import { LoginComponent } from '@app/login/login.component';
import { RegisterComponent } from '@app/register/register.component';
import { ResetPasswordComponent } from '@app/resetpassword/resetpassword.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'resetpassword',
    component: ResetPasswordComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'main',
    canActivate: [AuthGuard],
    loadChildren: './main/main.module#MainModule',
  },

  // otherwise redirect to home
  { path: '**', redirectTo: 'login' },
];

export const routing = RouterModule.forRoot(routes);
