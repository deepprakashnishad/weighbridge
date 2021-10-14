import { Component, HostListener, Inject, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import {ActivatedRouteSnapshot, Router, RoutesRecognized} from '@angular/router';
import {AuthenticationService} from '../authentication/authentication.service';
import { Title } from '@angular/platform-browser';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Permission } from '../admin/permission/permission';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { HtmlViewerComponent } from '../shared/html-viewer/html-viewer.component';
import { MyIpcService } from '../my-ipc.service';
import { environment } from '../../environments/environment';


@Component({
	selector: 'app-navigation',
	templateUrl: './navigation.component.html',
	styleUrls: ['./navigation.component.scss'],
	animations: [
		trigger('openClose', [
			state('open', style({
				opacity: 1,
				transform: 'translateX(0%)'
			})),
			state('closed', style({
				opacity: 0.5,
				transform: 'translateX(100%)'
			})),
			transition('open => closed', [
				animate('300ms')
			]),
			transition('closed => open', [
				animate('300ms')
			]),
		])
	]
})
export class NavigationComponent implements OnInit {

	isLoggedIn: boolean  = false;
	isSidebarOpen: boolean = false;
	name: String;
	@ViewChild("navToolbar") navToolbar;

	private readonly SHRINK_TOP_SCROLL_POSITION = 5;
	shrinkToolbar = false;
  elementPosition: any;
  allowedPermissionList: Array<Permission> = [];
  selectedMenu: string;

  	constructor(
		private authenticationService: AuthenticationService,
    private router: Router,
    private ngZone: NgZone,
		private titleService: Title,
      private renderer: Renderer2,
      private dialog: MatDialog,
      private ipcService: MyIpcService
	) { }

	ngOnInit() {
		this.router.events.subscribe((data) => {
	        if (data instanceof RoutesRecognized) {
	          var title = data.state.root.firstChild.data.title;
	          this.titleService.setTitle(title);
	        }
	    });

		this.authenticationService.isLoggedIn.subscribe(value => {
	      this.isLoggedIn = value;
	      if(value){
	      	this.name = this.authenticationService.getTokenOrOtherStoredData("fullname");
	      }
    });

    let permissionList: any = this.authenticationService.getTokenOrOtherStoredData('permissions')
    if (permissionList === undefined) {
      return false;
    }
    this.allowedPermissionList = JSON.parse(permissionList);

    this.renderer.listen('window', 'click', (e: Event) => { });

    this.getSelectedButton();
  }

  getSelectedButton() {
    if (window.location.href.indexOf("admin")) {
      this.selectedMenu = "administration"
    } else if (window.location.href.indexOf("weighment")) {
      this.selectedMenu = "dataentry";
    } else if (window.location.href.indexOf("reports")) {
      this.selectedMenu = "reports";
    }
  }

	ngAfterViewInit(): void {
	}

	/* @HostListener('document:keydown', ['$event']) handleKeydown(e: KeyboardEvent){
		console.log(e);
    } */

	toggleLoginStatus(isLoggedIn){
		if(isLoggedIn){
			this.isLoggedIn = false;
    		this.authenticationService.logout();
		}else{
			this.router.navigate(['/login']);
		}
	}

	navigateTo(path, selectedMenu=""){
    if (path && path !== "logout") {
      this.selectedMenu = selectedMenu;
      this.ngZone.run(() => {
        this.router.navigate([path]);
      });

    } else if (path === "logout") {
      this.ngZone.run(() => {
        this.authenticationService.logout()
      });
    }
  }

  refresh() {
    window.location.reload();
  }

  isAuthorized(accessListReqd) {
    return this.allowedPermissionList.some(ele1 => {
      if (ele1.id === accessListReqd)
          return true;
    });
  }

  alertLogout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Confirmation",
        message: "Are you sure to logout?"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.navigateTo("logout");
      }
    });
  }

  showInfoAlert() {
    var infoHtml = `<h2>Product Name: Accubridge</h2><h2>Version: ${environment.version}</h2><h2>&copy 2021 Notamedia Private Ltd.</h2><h2>Visit https://notamedia.com </h2>`;
    this.ipcService.invokeIPC("getAppInfo", []).then(results => {
      this.dialog.open(HtmlViewerComponent, {
        data: {
          htmlContent: infoHtml
            .replace("{appName}", results['name'])
            .replace("{version}", results['version'])
        }
      });
    });
    
  }
}
