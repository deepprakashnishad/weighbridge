import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myfilter'
})
export class MyFilterPipe implements PipeTransform {

  transform(items: any[], properties:string[], filterStr: any, isCaseInSensitive?:boolean): any {
    if(!items || !filterStr){
    	return items;
    }
    // filter items array, items which match and return true will be
        // kept, false will be filtered out
    if(!isCaseInSensitive){
    	return items.filter(
	    	item => {
	    		for(let i=0;i<properties.length;i++){
	    			if(item[properties[i]].indexOf(filterStr)>-1){
	    				return item;
	    			}	
	    		}
	    	}
    	);
    }else{
    	return items.filter(
	    	item => {
	    		for(let i=0;i<properties.length;i++){
	    			if(item[properties[i]].toLowerCase().indexOf(filterStr.toLowerCase())>-1){
	    				return item;
	    			}	
	    		}
	    	}
    	);
    }
    
  }

}
