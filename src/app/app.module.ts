import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SuiModule } from 'ng2-semantic-ui';
import { NgxElectronModule } from 'ngx-electron';
import { HttpClientModule } from '@angular/common/http';

// Main App
import { AppComponent } from './app.component';

// Browser
import { BrowserComponent } from './components/browser/browser.component';
import { ToolbarComponent } from './components/browser/toolbar/toolbar.component';
import { NavigationErrorsModalComponent } from './components/browser/toolbar/navigation-errors-modal/navigation-errors-modal.component';
import { TabClosingConfirmationModalComponent } from './components/browser/tab-closing-confirmation-modal/tab-closing-confirmation-modal.component';
import { StatusbarComponent } from './components/browser/statusbar/statusbar.component';

// Sidebar
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotificationsModalComponent } from './components/sidebar/notifications-modal/notifications-modal.component';
import { ReferredUsersModalComponent } from './components/sidebar/referred-users-modal/referred-users-modal.component';
import { SupportModalComponent } from './components/sidebar/support-modal/support-modal.component';
import { MyAccountDataModalComponent } from './components/sidebar/my-account-data-modal/my-account-data-modal.component';
import { LoginModalComponent } from './components/sidebar/login-modal/login-modal.component';
import { LogoutModalComponent } from './components/sidebar/logout-modal/logout-modal.component';
import { VersionErrorModalComponent } from './components/sidebar/version-error-modal/version-error-modal.component';

// Loading
import { LoadingComponent } from './components/loading/loading.component';

// Pipes
import { SafeHtml } from './pipes/safeHtml';

// Services
import { ApiService } from './services/api.service';
import { NotificationService } from './services/notification.service';
import { UserService } from './services/user.service';
import { AppDataService } from './services/app-data.service';
import { ExtractorFactoryService } from './services/extractor-factory.service';
import { UtilsService } from './services/utils.service';
import { OsNotificationService } from './services/os-notification.service';
import { SignalRService } from './services/signal-r.service';
import { GlobalsService } from './services/globals.service';

@NgModule({
    declarations: [
        AppComponent,
        BrowserComponent,
        ToolbarComponent,
        SidebarComponent,
        NotificationsModalComponent,
        NavigationErrorsModalComponent,
        ReferredUsersModalComponent,
        SupportModalComponent,
        MyAccountDataModalComponent,
        LogoutModalComponent,
        VersionErrorModalComponent,
        LoadingComponent,
        SafeHtml,
        TabClosingConfirmationModalComponent,
        StatusbarComponent,
        LoginModalComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        SuiModule,
        NgxElectronModule,
        HttpClientModule
    ],
    providers: [
        ApiService,
        NotificationService,
        UserService,
        AppDataService,
        ExtractorFactoryService,
        UtilsService,
        OsNotificationService,
        SignalRService,
        GlobalsService
    ],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
    entryComponents: [
        NotificationsModalComponent,
        NavigationErrorsModalComponent,
        ReferredUsersModalComponent,
        SupportModalComponent,
        MyAccountDataModalComponent,
        LoginModalComponent,
        LogoutModalComponent,
        TabClosingConfirmationModalComponent,
        VersionErrorModalComponent
    ]
})
export class AppModule { }