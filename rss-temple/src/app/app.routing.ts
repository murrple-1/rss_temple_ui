import { Routes } from '@angular/router';

import { NoAuthGuard, AuthGuard } from '@app/guards/auth.guard';
import { LoginComponent } from '@app/components/login/login.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/resetpassword/resetpassword.component';
import { VerifyComponent } from '@app/components/verify/verify.component';

export const routes: Routes = [
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
    loadChildren: async () => {
      const m = await import('./routes/main/main.module');
      return m.MainModule;
    },
  },
  { path: '**', redirectTo: 'login' },
];
