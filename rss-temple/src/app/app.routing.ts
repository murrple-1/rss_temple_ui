import { RouterModule, Routes } from '@angular/router';

import { NoAuthGuard, AuthGuard } from '@app/guards/auth.guard';
import { LoginComponent } from '@app/components/login/login.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/resetpassword/resetpassword.component';
import { VerifyComponent } from '@app/components/verify/verify.component';

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
  },
  {
    path: 'verify',
    component: VerifyComponent,
  },
  {
    path: 'main',
    canActivate: [AuthGuard],
    loadChildren: './routes/main/main.module#MainModule',
  },

  { path: '**', redirectTo: 'login' },
];

export const routing = RouterModule.forRoot(routes);
