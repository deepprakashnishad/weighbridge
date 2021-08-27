import { Injectable } from '@angular/core';
import { 
	CanLoad,
	CanActivate,
	Route,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
 } from '@angular/router'
import { AuthenticationService } from './authentication.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate, CanLoad{

 	constructor(
  		private authenticationService: AuthenticationService,
  		private router: Router
	) { }

  	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
  		let url: string = state.url
		  let loginErrorMessage = 'Insufficient permission. Please login as authorized user.'
		  if(route.data.loginErrorMessage){
			  loginErrorMessage = route.data.loginErrorMessage;
		  }

		  if((route.data.permissions===undefined || route.data.permissions?.length===0) && 
			  ((route.data.isLoggedIn && this.authenticationService.isLoggedIn.getValue()) || 
			  !route.data.isLoggedIn || route.data.isLoggedIn===undefined)){
			  return true;
		  }
  		
  		let reqdAccessList = route.data.permissions
	  	if(this.authenticationService.authorizeUser(reqdAccessList)){ 
	  		return true 
	  	}

	  	this.authenticationService.redirectUrl = url
	  	this.router.navigate(['/login', {'error':[loginErrorMessage]}])
	  	return false
  	}

  	canLoad(route: Route):boolean{
  		let url: string = `/${route.path}`;
  		let reqdAccessList = route.data.permissions
  		if(this.authenticationService.authorizeUser(reqdAccessList)){
  			return true
  		}

  		this.authenticationService.redirectUrl = url
	  	this.router.navigate(['/login', {'error':['Insufficient permission. Please login as authorized user.']}])
	  	return false
  	}
}
