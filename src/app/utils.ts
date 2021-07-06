export class Utils{

    constructor(){

    }

    static randomNumberGenerator(length: number = 4, min: number = 0, max: number=999999){
        var result=9999999;
        while(true){
            if(result < min || result > max){
                result = Math.floor(Math.random() * Math.pow(10, length)) + 1
            }else{
                return result;
            }
        }
    }

    static randomStringGenerator(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    }
}