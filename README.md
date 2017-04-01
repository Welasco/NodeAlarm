# DSC IT-100 (RS232) NodeJS Alarm and SmartThings
Credits
-------
I'm really gratefull that very knowldgeble guys have shared their research and projects in github and forums.

This project was inspired in those projects:

 - https://github.com/entrocode/SmartDSC
 - https://github.com/isriam/smartthings-alarmserver/
 - https://github.com/kholloway/smartthings-dsc-alarm
 - https://github.com/yracine/DSC-Integration-with-Arduino-Mega-Shield-RS-232


History
-------
This is just one more variant available to make your DSCAlarm system Smart with SmartThings.

The majority of those amazing projects available are using EnvisaLink board. If you already have one I suggest to you to use one of them.

My favority project is the one using Arduino but unfortunately the SmartThing Shield is deprecated and no longer available in the market.

I already have the DSC IT-100 board for that reason I decided to use it.

The project is on top of Raspberry Pi running NodeJS and SmartThings REST API.

Prerequisites
--------------
* Compatible DSC Alarm System 
* [IT-100 interface](http://www.dsc.com/index.php?n=products&o=view&id=22)
* [Raspberry PI](https://www.raspberrypi.org/products/)
* [USB to Serial cable](https://www.insigniaproducts.com/pdp/NS-PU99501/5883029)

Required Software
-----------------
* Raspbian (latest)
* NodeJS
* Forever
* SmartThing developer Access

Preparing Raspberry PI
----------------------
Install the latest available Raspbian Linux on your Raspberry PI. Official link with step by step available [Here](https://www.raspberrypi.org/documentation/installation/installing-images/).
After you have installed Raspbian I would recommend update all available packets, just run "sudo apt-get update" then "sudo apt-get upgrade".

Keep in mind the easyest way to set a static IP address on your Raspberry. 
The SmartThing HUB will send web request to NodeJS, your Raspberry PI IP address will be configured in the DSCAlarmDeviceType using SmartThing app in your phone.
That's how SmartThing HUB knows how to reach your Raspberry PI. If you prefer you can just go to your DHCP in your house and reserv an IP to you Raspberry PI using MAC.
There is a really good step by step [Here](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/) covering almost everything we need.

Now it's time to install NodeJS. Just type sudo "apt-get install nodejs".







