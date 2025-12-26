---
title:
draft: false
tags:
  - tech/excel
  - project
description:
created: 2025-05-07
modified: 2025-05-09
---
During my cipher kick in mid-2025 I devised a spreadsheet that will generate and decode simple substitution ciphers based on an input. It isn't anything super special, but it's a neat application of the VLOOKUP function, and the function to calculate Caesar cipher shifts is one that I'm rather proud of, more on that below.

You can easily add an alphabet if you want to by adding an entry to the code in use table and the alphabet itself to the corresponding column.

[Download it here!](https://drive.google.com/uc?export=download&id=1_2gzf9Xz6Fl0kzxHNXN6b7VHD8mZuRrP)

The linked file uses the following formula to generate Caesar ciphers based on an inputted shift:

```
=IF(VLOOKUP(L3,$J$3:$K$28,2)+$H$6>26,VLOOKUP(VLOOKUP(L3,$J$3:$K$28,2)+$H$6-26,$K$3:$L$28,2),VLOOKUP(K3+$H$6,Decoder!$K$3:$L$28,2))
```

That formula required an entire extra alphabet and modulation of the shift in an external block to function. It was complicated. While in the car to the dentist shortly after writing the original sheet, I realized the below formula is far simpler and does the exact same thing:

```
=IFERROR(VLOOKUP(MOD(K3+-UI!$D$3,26),Decoder!$K$3:$L$28,2),"z")
```

Feel free to replace the formula if you’re following along with the spreadsheet at home.

Although I felt dumb when I realized how much simpler the formula could be, the original formula would work even if the alphabet didn’t end in “Z” so it still has utility until I swap out the z in the second formula with an absolute reference to the last letter of the alphabet.

# Historical Note
This file was originally published in conjunction with [[25-5-7 - Beloved]] and this accompanying cipher:
> Pm fvb kpku'a nblzz hsylhkf, aol zbiqlja vm aopz wvlt pz tf nvvk mypluk, Tpjyvzvma Lejls.

You can use the spreadsheet to find out what it actually means.