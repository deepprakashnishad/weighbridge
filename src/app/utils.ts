import { MyDbService } from "./my-db.service";
import { QueryList } from "./query-list";

export const SAP_ENCRYPTION_KEY = "ninn34nunown32ondo23neono2i323nnos";

export class Utils{

  constructor(private dbService: MyDbService,){
    
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

  static mysql_real_escape_string(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
        case "\0":
          return "\\0";
        case "\x08":
          return "\\b";
        case "\x09":
          return "\\t";
        case "\x1a":
          return "\\z";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\"":
        case "'":
        case "\\":
        case "%":
          return "\\" + char; // prepends a backslash to backslash, percent,
        // and double/single quotes
        default:
          return char;
      }
    });
  }

  static removeWhiteSpaces(str) {
    return str.replace(/\s/g, "");
  }

  static formatDate(dateStr){
    var mDate = new Date(dateStr);
    var res = `${mDate.getDate()}/${mDate.getMonth() + 1}/${mDate.getFullYear()} ${('0'+mDate.getHours()).slice(-2)}:${('0'+mDate.getMinutes()).slice(-2)}` ;
    console.log(res);
    return res;
  }
}
