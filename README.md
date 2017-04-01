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
* SmartThing developer Access

Preparing Raspberry PI
----------------------
Install the latest available Raspbian Linux on your Raspberry PI. Official link with step by step available [HERE](https://www.raspberrypi.org/documentation/installation/installing-images/).
After you have installed Raspbian I would recommend update all available packets, just run "sudo apt-get update" then "sudo apt-get upgrade".

Keep in mind the easyest way to implement this project is configuring a static IP address on your Raspberry Pi. 
The SmartThing HUB will send web request to NodeJS, your Raspberry Pi IP address will be configured in the DSCAlarmDeviceType using SmartThing app in your phone.
That's how SmartThing HUB knows how to reach your Raspberry Pi. If you prefer you can just go to your DHCP in your house and reserv an IP to you Raspberry PI using MAC.
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

The default port is configured to 3000 in config.js. You can now open your browser and check if you can access like: http://\<RaspberryPI-IPAddress>:3000/. 
We expect to have a message saying "DSC Alarm Running".

If you receve the message it means you have done a good job so far :).

Now we will test the communication between DSC IT-100 and your Raspberry PI.
Plug your USB to Serial cable to "DSC IT-100".
Open your browser and access http://\<RaspberryPI-IPAddress>:3000/api/alarmArmAway
It will send a command to your alarm to Arm. Your alarm keypad will start beeping and preparing the system to arm.
Before we test if we can disarm the alarm we need to setup your password on config.js file. Open the file and update the config entry alarmpassword with your password.
To test if the system will disarm open your browser one more time and access http://\<RaspberryPI-IPAddress>:3000/api/alarmArmAway
Your alarm will desarm.

Now let's make DSCAlarm work as a service.

First we need to make it executable. Type chmod +755 dscalarm.js.
Copy the file dscalarm.service to /lib/systemd/system.
Reload the daemons type "sudo systemctl daemon-reload". Let's make it run on boot type "sudo systemctl enable dscalarm". Now we can start dscalarm type "sudo systemctl start dscalarm".
To check if the services is up and running type "sudo systemctl status dscalarm". To check the log type "sudo journalctl --follow -u dscalarm".

Reference: https://certsimple.com/blog/deploy-node-on-linux

Lets restart your Raspberry Pi and check if dscalarm is up and running. Don't forget to let the USB to Seral cable plugged, if it's not plugged it will fail.
Check if you can arm and disarm your alarm accessing the URLs that we have already used.

If you reach at this poing it means you are able to arm and disarm the alarm using the URLs above and you are ready to start preparing the code on Smartthings.

Preparing SmartThing Code
--------------------------
First you need to determine your shard location. Shard is where your SmartThing account is hosted. In order to figure it out access this link [HERE](https://community.smartthings.com/t/faq-how-to-find-out-what-shard-cloud-slice-ide-url-your-account-location-is-on/53923).
Usually if your SmartThing account was created after september 2015 your shard will be: graph-na02-useast1.api.smartthings.com.

Now lets access your SmartThing shard and login with your SmartThing account if everything is fine you will be able to see all yours SmartThings devices in the Menu "My Devices".
Keep in mind that if your account is empty nothing will be listed.

The SmartThings have 3 main files:
 - DSCAlarmApp.groovy
 - DSCAlarmDeviceType.groovy
 - DSCOpenCloseDeviceType.groovy

__DSCAlarmApp.groovy__:

That's our SmartApp (Service Manager). This is where we handle the Web requests that NodeJS will send to SmartThings.
Using your shard (SmartThing IDE Web Site) we will install your DSCAlarm Smpart App. Here is the steps:
 - Click on My SmartApps.
 - Click New SmartApp.
 - Click From Code.
 - Now Copy and Paste the file content to and click Create.
 - Click in Publish then For Me.

__DSCAlarmDeviceType.groovy__:
 
That's our DSC Alarm Device type. 
This is the Virtual Alarm device that will be present in your SmartThing Mobile App and also where you will be able to send commands to your alarm like Arm, Disarm and configure your Raspberry Pi IP Address and Port.
Using your shard (SmartThing IDE Web Site) we will install your DSCAlarm Device type. Here is the steps:
 - Click on My Device Handlers.
 - Click Create New Device Handler. 
 - Click From Code.
 - Now Copy and Paste the file content to and click Create.
 - Click in Publish then For Me.

__DSCOpenCloseDeviceType.groovy__:

That's our Open/Close sensor.
This is the Virtual Open/Close sensor that will be representing each Zone that you may have on your alarm.
Using your shard (SmartThing IDE Web Site) we will install your DSCAlarm Open/Close Device type. Here is the steps:
 - Click on My Device Handlers.
 - Click Create New Device Handler. 
 - Click From Code.
 - Now Copy and Paste the file content to and click Create.
 - Click in Publish then For Me.

Creating Device Types
----------------------
Now we will create the device types that we just have installed.
Using your shard (SmartThing IDE Web Site) we will create your DSCAlarm Alarm Device type. Here is the steps:
 - Click on My Devices.
 - Click New Deice.
 - A form with a couple of fields will open, we need to full fill the follwing fields:
   - Name: DSCAlarm
   - Label: DSCAlarm
   - Device Network ID: dscalarmtype
   - Type: DSCAlarmDeviceType
   - Location: <Your Location>
   - Hub: <Your HUB>
 - Click Create.

__The DSCAlarmDeviceType Device Network ID is hardcoded in the DSCAlarm App at method updateAlarmDeviceType close to line 219.__

Now it's time to create DSCAlarm Open/Close Sensor.
We will create one device "DSCAlarm Open/Close Sensor" per zone that you have on your alarm.
Using your shard (SmartThing IDE Web Site) we will create your DSCAlarm Open/Close Device type. Here is the steps:
 - Click on My Devices.
 - Click New Deice.
 - A form with a couple of fields will open, we need to full fill the follwing fields:
   - Name: Zone1
   - Label: Zone1
   - Device Network ID: dsczone001
   - Type: DSCOpenCloseDeviceType
   - Location: <Your Location>
   - Hub: <Your HUB>
 - Click Create.

Don't forget to create one "DSCAlarm Open/Close Sensor" per zone replacing the zone number with your zone.
The Device Network ID must have to have the 00 before the zone number like dsczone001, dsczone002, dsczone003.
 
__The DSCOpenCloseDeviceType Device Network ID is hardcoded in the DSCAlarm App at method updateZoneDeviceType close to line 184.__

Configuring OAuth Authentication
---------------------------------
In order to allow NodeJS Web requests to access SmartThing Smart App we need to create an access token and get the AppID.
Using your shard (SmartThing IDE Web Site) we will  we will enable OAuth for DSCAlarm Smart App. Here is the steps:
 - Click on My SmartApps.
 - Click on the DSCAlarm App that we have created.
 - The code view will be opened, click on App Settings.
 - Click OAuth.
 - Click Enable OAuth in Smart App.
 - Copy the Client ID and Client Secret that was generated.

Now lets get generate your AppID and AccessToken.

Requirements:
 Any Web Browser (I used Chrome but Safari/Firefox and others should work just fine)
 Your Smartthings app OAuth Client ID and Client ID Secret values

Modify the "First URL" below and replace the $client variable at the end of the URL with the actual OAuth client id code from your Smartthings App so it looks something like client_id=4832fdhs-343shfd-fdhjsdn2-sfjkd

First URL:

    https://graph-na02-useast1.api.smartthings.com/oauth/authorize?response_type=code&redirect_uri=http://localhost&scope=app&client_id=$client

Paste the resulting line into your web browser (note it's worthwhile to save all these URLs you are making until it's all setup).
You should see the Smartthings login page, login with your usual developer credentials.

You will now be at an Authorization page, click on the dropdown and select your From: location. Now you need to authorize the DSCAlarm SmartApp device you created earlier, it should be in the list under "Allow Endpoint to control These Things". Make sure it's selected and then click the "Authorize" button at the bottom.

You will now see a error page in your web browser about not being able to connect, this is OK and expected. Look at the URL, it looks something like below. We need the code=YdJJS2y bit for the next step so copy that down and save it.

Example returned URL via First URL:

    http://localhost/?code=YdJJS2y

Ok now for the Second URL below, replace $client with your OAuth Client ID again and replace $secret with your OAuth Client ID Secret and finally replace $code with the code from above (just the bits after the equal sign so for this example just YdJJS2y).

Second URL:

    https://graph-na02-useast1.api.smartthings.com/oauth/token?grant_type=authorization_code&scope=app&redirect_uri=http://localhost&client_id=$client&client_secret=$secret&code=$code

Paste your resulting new Second URL line into the web browser again (same page/tab that you used last time works well). If all went well you should see JSON output on the page with a field called "access_token". Copy the access_token value down it looks something like 'a743h22sds-221sahdbabv-sh282hs-sn21712'.

SAVE THAT ACCESS CODE!

Last step!

You now need to get your apps ID so you can reference it directly, go to the URL below and if prompted login with your Smartthings developer id you have been using.

To get your appID access the following URL replacing $accesstoken with your SmartAppp access token created in the last step.

	https://graph-na02-useast1.api.smartthings.com/api/smartapps/endpoints?access_token=$accesstoken

To list all your installed apps IDs you can use this URL:

    https://graph-na02-useast1.api.smartthings.com/api/smartapps/installations/

Search for a 'label' field matching your application name and copy down the 'id' field right above it.
(It helps if you have a JSON formatted plugin in your web browser but it's just as easy to grab if you don't)

Ok now one final test to make sure everything is working, lets test your app with the URL below. You need to replace $appID with the 'id' field you just grabbed above.
Replace $access_token with the token you saved above.
The command ZN-609001 below corresponds to "Zone 1 Open" in the NodeJS and then we are telling the app that it's an open event for "dsczone001".

Test URL:

    https://graph-na02-useast1.api.smartthings.com/api/smartapps/installations/$appID/dscalarm/ZN-610001/1?access_token=$access_token

In case you would like to close the senssor just replace the command ZN-609001 to ZN-610001.

__Now we need to change the config.js file on your Raspberry Pi. You need to update both appid and accesstoken. Save the file and restart the service typing "sudo systemctl restart dscalarm".__

Configuring SmartThing Mobile App
---------------------------------
Now open SmartThings Mobile app on your phone. Go to Marketplace area. In the top menu touch in SmartApps.
Scrool all way down until My Apps. You will see DSCAlarm App listed, touch to open.
We have two sections DSCAlarmType and MonitoredZones. Select our DSCAlarmDeviceType in DSCAlarmType and select all available Zones in Monitored Zones. Touch in Done.
It will allow the DSCSmartApp to access those device types.

Here is the last step we need to setup your Raspberry Pi IP Address in your alarm virtual device.
In your SmartThing mobile app go to MY Home area. Open DSCAlarmDeviceType you will see the tiles where you will be able to manage your alarm. In the top right corner touch in the little engine icon.
In the Server IP Address type your Raspberry Pi IP Address. In Server Port type 3000 and touch Done.

Now you are able to Arm and Disarm your Alarm just touching in the desired option in your screen.

Troubleshooting
---------------
After some time using this project I found a couple of problems related with USB Serial cable and Raspberry Pi.
Some times it just stop sending and receiving data. 
Using dmesg I found this error: "ftdi_sio ttyUSB0: usb_serial_generic_read_bulk_callback - urb stopped: -32".
I did a internet research and found this link with a solution that worked for me: https://github.com/raspberrypi/linux/issues/1187

You have to open /boot/cmdline.txt and add an entry to dwc_otg.speed=1. It changed the USB Bus speed to USB 1.1 but fix the issue.
Here is how my /boot/cmdline.txt looks like:

		dwc_otg.speed=1 dwc_otg.lpm_enable=0 console=serial0,115200 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait

I hope it can help you too.

