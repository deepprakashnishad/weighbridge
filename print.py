import os, sys
import win32print

def formatData(args):
  cnt = 1;
  decimal_form_feed = 12
  decimal_line_feed = 10
  decimal_carriage_return = 13

  byteArr = bytearray()

  # Reverse feed
  # byteArr.extend(bytes("\u001bj2", "utf-8"))

  # byteArr.extend(bytes("\u001b$0", "utf-8"))

  # ESC J Advance print position vertically
  # param n where 0 <= n <=255
  # Advances vertical position n/216 or n/180 inches

  # Set page size in terms of line numbers
  # byteArr.extend(bytes("\u001bC10", "utf-8"))
  # print(len(args))
  while(cnt < len(args)):
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
    elif args[cnt]=="lf":
      mCnt = 0
      #while mCnt < int(args[cnt+1]):
       # mCnt = mCnt+1
        #byteArr.extend(bytes("\n", "utf-8"))
        #byteArr.extend(bytes("\u001bJ1", "utf-8"))
    elif args[cnt]=="rf":
      mCnt = 0
      # while mCnt < int(args[cnt+1]):
      #  byteArr.extend(bytes("\u001bj2", "utf-8"))
      #  mCnt = mCnt+1
      
    cnt = cnt+2;
  byteArr.extend(decimal_carriage_return.to_bytes(2, 'big'))
  byteArr.extend(decimal_form_feed .to_bytes(2, 'big'))
  #byteArr.extend(decimal_carriage_return.to_bytes(2, 'big'))
  #byteArr.extend(decimal_line_feed.to_bytes(2, 'big'))
  print(byteArr)
  mBytes = bytes(byteArr)
  return mBytes
    

printer_name = win32print.GetDefaultPrinter ()

raw_data = formatData(sys.argv);
hPrinter = win32print.OpenPrinter (printer_name)
try:
  printer_info = win32print.GetPrinter(hPrinter, 2)
  drivers = win32print.EnumPrinterDrivers(None, None, 2)
  for driver in drivers:
    if driver["Name"] == printer_info["pDriverName"]:
        printer_driver = driver
  raw_type = "XPS_PASS" if printer_driver["Version"] == 4 else "RAW"
  hJob = win32print.StartDocPrinter (hPrinter, 1, (raw_data.decode("utf-8"), None, raw_type))
  try:
    win32print.StartPagePrinter (hPrinter)
    win32print.WritePrinter (hPrinter, raw_data)
    win32print.EndPagePrinter (hPrinter)
  finally:
    win32print.EndDocPrinter (hPrinter)
finally:
  win32print.ClosePrinter (hPrinter)
