# DSC IT-100 (RS232) NodeJS Alarm and SmartThings
Credits
-------
I'm really grateful that very knowledgeable guys have shared their research and projects in github and forums.

This project was inspired in those samples:

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
Install the latest available Raspbian Linux on your Raspberry PI. Official link with step by step available [HERE](https://www.raspberrypi.org/documentation/installation/installing-images/).
After you have installed Raspbian I would recommend update all available packets, just run "sudo apt-get update" then "sudo apt-get upgrade".

Keep in mind the easyest way to set a static IP address on your Raspberry. 
The SmartThing HUB will send web request to NodeJS, your Raspberry PI IP address will be configured in the DSCAlarmDeviceType using SmartThing app in your phone.
That's how SmartThing HUB knows how to reach your Raspberry PI. If you prefer you can just go to your DHCP in your house and reserv an IP to you Raspberry PI using MAC.
There is a really good step by step [HERE](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/) covering almost everything we need.

Now it's time to install NodeJS. Just type sudo "apt-get install nodejs".

Create a folder named dscalarm under /home/pi it will look like this "/home/pi/dscalarm".

Now copy the following files under /home/pi/dscalarm:
 - config.js
 - dscalarm.js
 - listserialports.js
 - package.json
 - dscalarm.service

Install all project dependencies using npm. Make sure you are in /home/pi/dscalarm and type "npm install". It will download all dependencies under /home/pi/dscalarm/node_modules.

Time to plug the "USB to Serial cable" in your Raspberry Pi USB port. We need to know witch port it was loaded. Run node listserialports.js it will list all available serial ports.
It will be something like "/dev/ttyUSB0". Open config.js and update the config entry linuxcom.

Let's test if everything is right. Now we will run the dscalarm.js for the first time just type "node dscalarm.js". Something like this will show in the screen:

		Starting DSCAlarm
		Modules loaded
		Detected OS Version: linux
		DSCAlarm Started
		Serial Port opened: /dev/ttyUSB0 BaudRate: 9600

The default port is configured to 3000 in config.js. You can now open your browser and check if you can access like: http://<RaspberryPI-IPAddress>:3000/. 
We expect to have a message saying "DSC Alarm Running".

If you receve the message it means you have done a good job so far :).

Now we will test the communication between DSC IT-100 and your Raspberry PI.
Plug your USB to Serial cable to "DSC IT-100".
Open your browser and access http://<RaspberryPI-IPAddress>:3000/api/alarmArmAway
It will send a command to your alarm to Arm. Your alarm keypad will start beeping and preparing the system to arm.
Before we test if we can disarm the alarm we need to setup your password on config.js file. Open the file and update the config entry alarmpassword with your password.
To test if the system will disarm open your browser one more time and access http://<RaspberryPI-IPAddress>:3000/api/alarmArmAway
Your alarm will desarm.

Now let's make DSCAlarm work as a service.

First we need to make it executable. Type chmod +755 dscalarm.js.
Copy the file dscalarm.service to /lib/systemd/system.
Reload the daemons type "sudo systemctl daemon-reload". Let's make it run on boot type "sudo systemctl enable dscalarm". Now we can start dscalarm type "sudo systemctl start dscalarm".
To check if the services is up and running type "sudo systemctl status dscalarm". To check the log type "sudo journalctl --follow -u dscalarm".

Reference: https://certsimple.com/blog/deploy-node-on-linux

Lets restart your Raspberry Pi and check if dscalarm is up and running. Don't forget to let the USB to Seral cable plugged, if it's not plugged it will fail.
Check if you can arm and disarm your alarm accessing the URLs that we have already used.





