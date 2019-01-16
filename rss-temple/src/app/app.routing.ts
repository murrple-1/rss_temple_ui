import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import { LoginComponent } from '@app/login/login.component';
import { RegisterComponent } from '@app/register/register.component';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
    { path: 'main', canActivate: [AuthGuard], loadChildren: './main/main.module#MainModule' },

    // otherwise redirect to home
    { path: '**', redirectTo: 'login' },
];

export const routing = RouterModule.forRoot(appRoutes);
