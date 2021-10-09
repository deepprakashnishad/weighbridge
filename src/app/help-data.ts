export class HelpData {
  static readonly map = {
    "DATA_SETUP": '<!DOCTYPE html PUBLIC " -//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> <html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" /> <title>Apconic Weighment Software</title> <style type="text/css"> body { margin:0 auto; margin-top:5px; } /* ----- HEADER ----- */ #header { background-color:#00a4ff; text-align:center; font-family:Verdana; font-weight:bold; font-size:15px; } /* ----- SUMMARY ----- */ #summary { background-color:#6ecbff; margin-top:5px; min-height:30px; /* for modern browsers */ height:auto !important; /* for modern browsers */ font-family:Helvetica; font-size:12px; padding: 12px; } /* ----- MAIN CONTENT ----- */ #content { background-color:#FFFFFF; margin-top:5px; min-height:250px; /* for modern browsers */ height:auto !important; /* for modern browsers */ font-family:Helvetica; font-size:12px; ; } /* ----- FOOTER ----- */ #footer { height:20px; background-color:#43b7f7; margin-top:5px; font-family: Verdana; font-size:11px; text-align: center; } </style> </head> <body> <div id="header"> Data Setup </div> <div id="summary"> This is a multi-tab form and very important part of software setup. All data fields, their types, inbound/outbound functionality and formula fields are defined here. Please note that no changes to data setup are allowed once there are weighment records captured in the system. </div> <div id="content"> <table> <tr> <td width="25%" valign="top"><b>Features:</b></td> <td>This tab is used to enable/disable important functionality of the application.</td> </tr> <tr> <td valign="top"><b>Tracking Field:</b></td> <td>The tracking field is used to recall the weighment record for subsequent weighments. Vehicle Number and Weigh Slip Number are the most frequently used tracking fields. </td> </tr> <tr> <td valign="top"><b>Search Fields:</b></td> <td> Search fields are the data entry fields that can also be used during reports / search to filter the records. This tab is used to configure the number of search fields, their display names and their data entry types. </td> </tr> <tr> <td valign="top"><b>System Constants:</b></td> <td> System constants are application level numeric fields like Rate, Parking Charges, Binding Material Percentage, etc. Generally these fields are used in additional fields that are of type formula. </td> </tr> <!--<tr> <td valign="top"><b>Additional Fields:</b></td> <td> Additional Fields are data entry fields. The difference with search fields is that the data entry type can also be numeric or formula in addition to the options available to search fields. It is important to note that additional fields cannot be used to filter the weighment records during search / reports. </td> </tr>--> </table> </div> <div id="footer" class="foot"><span style="display:inline-block; vertical-align:middle">Copyright &copy; 2014 Apconic Software Pvt. Ltd.</span></div> </body> </html>',
    "FEATURES": "",
    "TRACKING_FIELDS": ""
  };
}
