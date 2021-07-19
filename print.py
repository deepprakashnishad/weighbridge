import os, sys
import win32print

def formatData(args):
  print("Arguments");
  print(args);
  cnt = 1;
  byteArr = bytearray()
  while(cnt < len(args)):
    print(cnt)
    if args[cnt]=="R":
      temp = bytes (args[cnt+1], "utf-8")
      byteArr.extend(temp)
      #print(byteArr)
    elif args[cnt]=="RB":
      temp = bytes ("\u001bE"+args[cnt+1]+"\u001bF", "utf-8")
      byteArr.extend(temp);
      #print(byteArr)
    elif args[cnt]=="D":
      temp = bytes ("\u001b\u000e"+args[cnt+1]+"\u001b\u0012", "utf-8")
      byteArr.extend(temp);
    elif args[cnt]=="DB":
      temp = bytes ("\u001b\u000e"+args[cnt+1]+"\u001b\u0012", "utf-8")
      byteArr.extend(temp);
    elif args[cnt]=="newline":
      temp = bytes ("\n", "utf-8")
      byteArr.extend(temp);
      cnt = cnt+1
      continue
      
    cnt = cnt+2;

  print("Came out")
  mBytes = bytes(byteArr)
  print(mBytes)
  return mBytes
    

printer_name = win32print.GetDefaultPrinter ()

raw_data = formatData(sys.argv);
hPrinter = win32print.OpenPrinter (printer_name)
try:
  hJob = win32print.StartDocPrinter (hPrinter, 1, (raw_data.decode("utf-8"), None, "RAW"))
  try:
    win32print.StartPagePrinter (hPrinter)
    win32print.WritePrinter (hPrinter, raw_data)
    win32print.EndPagePrinter (hPrinter)
  finally:
    win32print.EndDocPrinter (hPrinter)
finally:
  win32print.ClosePrinter (hPrinter)
