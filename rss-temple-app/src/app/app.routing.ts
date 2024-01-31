import { Routes } from '@angular/router';

import { LoginComponent } from '@app/components/login/login.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/reset-password/reset-password.component';
import { VerifyComponent } from '@app/components/verify/verify.component';
import { AuthGuard, NoAuthGuard } from '@app/guards/auth.guard';

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
