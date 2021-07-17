import os, sys
import win32print

def formatData(args):
  print("Arguments");
  print(args);
  cnt = 1;
  byteArr = bytearray()
  while(cnt < len(args)):
    if args[cnt]=="R":
      temp = bytes (args[cnt+1], "utf-8")
      byteArr.extend(temp)
      continue
    elif args[cnt]=="RB":
      temp = bytes ("\u001bE"+args[cnt+1]+"\u001bF", "utf-8")
      byteArr.extend(temp);
      continue
    cnt = cnt+1;

  return bytes(byteArr)
    

printer_name = win32print.GetDefaultPrinter ()
#
# raw_data could equally be raw PCL/PS read from
#  some print-to-file operation
#
#if sys.version_info >= (3,):
#  raw_data = bytes ("\u001bE"+sys.argv[1]+"\u001bF"+sys.argv[2], "utf-8")
#else:
#  raw_data = sys.argv[1]
print("Hare Krishna");
raw_data = formatData(sys.argv);
#raw_data = bz2.decompress(inputStr.encode('raw_unicode_escape'))
print(raw_data);
hPrinter = win32print.OpenPrinter (printer_name)
try:
  #hJob = win32print.StartDocPrinter (hPrinter, 1, ("\u001b"+"E"+"test of raw data"+"\u001b"+"F"+" now normal printing", None, "RAW"))
  hJob = win32print.StartDocPrinter (hPrinter, 1, (raw_data.decode("utf-8"), None, "RAW"))
  try:
    win32print.StartPagePrinter (hPrinter)
    win32print.WritePrinter (hPrinter, raw_data)
    win32print.EndPagePrinter (hPrinter)
  finally:
    win32print.EndDocPrinter (hPrinter)
finally:
  win32print.ClosePrinter (hPrinter)


#"\u001bEtest of raw data\u001bF now normal printing"
