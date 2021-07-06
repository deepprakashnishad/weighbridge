import { Component, HostListener, Inject, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import {Router, RoutesRecognized} from '@angular/router';
import {AuthenticationService} from '../authentication/authentication.service';
import { Title } from '@angular/platform-browser';
import { trigger, state, style, transition, animate } from '@angular/animations';


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

  	constructor(
		private authenticationService: AuthenticationService,
		private router: Router,
		private titleService: Title,
		private renderer: Renderer2,
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
	      	this.name = this.authenticationService.getTokenOrOtherStoredData("name");
	      }
	    });

		this.renderer.listen('window', 'click', (e: Event)=>{});	
	}

	ngAfterViewInit(): void {
	}

	/* @HostListener('document:keydown', ['$event']) handleKeydown(e: KeyboardEvent){
		console.log(e);
    } */

	@HostListener('document:scroll', []) scrollHandler(){
		console.log("I am scrolled");
    }

	@HostListener('window:scroll', []) windowScrollHandler(){
		console.log("I am scrolled");
    }

	toggleLoginStatus(isLoggedIn){
		if(isLoggedIn){
			this.isLoggedIn = false;
    		this.authenticationService.logout();
		}else{
			this.router.navigate(['/login']);
		}
	}

	navigateTo(path){
		if(path){
			this.router.navigate([path]);
		}
	}
}
