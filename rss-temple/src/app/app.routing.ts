import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, NoAuthGuard } from './_guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
    { path: 'main', component: MainComponent, canActivate: [AuthGuard] },

    // otherwise redirect to home
    { path: '**', redirectTo: 'login' },
];

export const routing = RouterModule.forRoot(appRoutes);
