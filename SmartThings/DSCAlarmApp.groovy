/**
 *  DSCAlarmApp
 *
 *  Author: Victor Santana
 *   based on work by XXX
 *  
 *  Date: 2017-03-26
 */

definition(
    name: "DSCAlarm App",
    namespace: "dscalarmapp",
    author: "Victor Santana",
    description: "SmartApp DSCAlarm",
    category: "Safety & Security",
    iconUrl: "https://graph.api.smartthings.com/api/devices/icons/st.Home.home3-icn",
    iconX2Url: "https://graph.api.smartthings.com/api/devices/icons/st.Home.home3-icn?displaySize=2x",
    iconX3Url: "https://graph.api.smartthings.com/api/devices/icons/st.Home.home3-icn?displaySize=3x",
    singleInstance: true,
    oauth: true
)

import groovy.json.JsonBuilder

// Falta acertar agora a App
preferences {
    page(name:"controllerSetup")
    //page(name: "ZoneSetup")
    //page(name: "ZoneSelection")
}
def controllerSetup() {
	dynamicPage(name: "controllerSetup",title: "Controller Setup", install:true) {
        section("Select DSCAlarmType:") {
            input "dscalarmtype", title: "DSCAlarmType","capability.alarm"
        }    
        section("Select monitored zones:") {
            input "monitoredzones", title: "Monitored Zones", "capability.sensor", multiple: true, required: false
        }    
    }

}

/*
def controllerSetup() {
	dynamicPage(name: "controllerSetup",title: "Controller Setup", nextPage:"ZoneSetup", uninstall:true) {
        section("Select DSCAlarmType:") {
            input "dscalarmtype", title: "DSCAlarmType","capability.alarm"
        }    
        section("How many Zones?") {
            input "zoneCount", title: "How many zones?","number"
        }    
    }

}
def ZoneSetup() {
   	dynamicPage(name: "ZoneSetup", title: "Zone Setup", , nextPage:"ZoneSelection") {
    	for (int i=1;i<=settings.zoneCount;i++) {
        	section("Zone " + i) {
                input "zone" + i, title: "Name", "string", description:"Zone " + i, required: false
                input "typezone" + i, "enum", title: "Type", options:["Open/Closed Sensor","Motion Detector"], required: false
            }
        }
    }
}

def ZoneSelection() {
   	dynamicPage(name: "ZoneSelection", title: "Zone Selection", install:true) {
        section("Monitored Zones") {
            input "monitoredzones", title: "Monitored Zone", "capability.sensor", required: false
        }

    }
}
*/
def installed() {
	log.debug "Installed with settings: ${settings}"
	initialize()
}

def updated() {
	log.debug "Updated with settings: ${settings}"
	//unsubscribe()
	initialize()
}


def initialize() {

    
    //subscribe(dscalarmtype, "response", zonestatusChanged)
    /*
    for (int i=1;i<=settings.zoneCount;i++) {
    	
    	def name = "dsczone00$i"
		def value = settings[name]

        log.debug "DSCAlarm SmartApp - checking device: ${name}, value: $value"

        def zoneType = settings["type" + name];

        zoneType = "DSCOpenCloseDeviceType"
        
        
        //if (zone == null || zoneType == "")
        //{
        //    log.debug "DSCAlarm SmartApp - checking selected devicetype: ${name}, value: $value"
        //    zoneType = "DSCOpenCloseDeviceType"
        //}
        //else if(zoneType == "Open/Closed Sensor"){
        //	zoneType = "DSCOpenCloseDeviceType"
        //}
        //else if(zoneType == "Motion Detector"){
        //	zoneType = "DSCMotionDeviceType"
        //}
        

        def existingDevice = getChildDevice(name)
        if(!existingDevice) {
            log.debug "DSCAlarm SmartApp - creating device: ${name}"
            def childDevice = addChildDevice("dscalarm", zoneType, name, null, [name: "${name}", label: value, completedSetup: true])
        }
        else {
            //log.debug existingDevice.deviceType
            //existingDevice.type = zoneType
            existingDevice.label = value
            existingDevice.take()
            log.debug "DSCAlarm SmartApp - device already exists: ${name}"
        }


    }
    
    //def delete = getChildDevices().findAll { it.deviceNetworkId.startsWith("dsczone") && !settings[it.deviceNetworkId] }
    //delete.each {
    //    log.debug "deleting child device: ${it.deviceNetworkId}"
    //    deleteChildDevice(it.deviceNetworkId)
    //}
	//runIn(300, "checkHeartbeat")
    */
}

def uninstalled() {
    removeChildDevices(getChildDevices())
}

private removeChildDevices(delete) {
    delete.each {
    	log.debug "deleting child device: ${it.deviceNetworkId}"
        deleteChildDevice(it.deviceNetworkId)
    }
}


mappings {
    path("/dscalarm/:command") {
        action: [GET: "parserDSCCommand"]
    }
}

def parserDSCCommand() {

    def cmd = params.command
    log.debug "DSCAlarm SmartApp - Received Alarm Command: $cmd"
    
    if(cmd.length() >= 4){
    	if(cmd.substring(0,2) == "ZN"){
        	updateZoneDeviceType(cmd)
            updateAlarmDeviceType(cmd)
        }
        else{
        	updateAlarmDeviceType(cmd)
        }
    }
    
	//else{
	//	log.debug "DSCAlarm SmartApp - unhandled command: $cmd"
	//	httpError(501, "$cmd is not a valid command")
	//}
	
}

private updateZoneDeviceType(String cmd) {
	def zoneidx = cmd.substring(6,9)
	def zonedeviceNetworkID = "dsczone" + zoneidx
	//def zonedevice = zoneswitches.find { it.deviceNetworkId == zonedeviceNetworkID }
    
    //def zonedevices2 = app.getChildDevices().find { it.deviceNetworkId == zonedeviceNetworkID }
    //log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice ZoneDevices2: $zonedevices2"
    
    
    //def zonedevices = app.getChildDevices()
    //log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice ChildNetworkID: $zonedevices"
    //def zonedevice = childDevice.find { it.deviceNetworkId == zonedeviceNetworkID }
    
    //def zonedevice = monitoredzones.find { it.deviceNetworkId == alarmdeviceNetworkID}
    //def zonedevice = monitoredzones.findAll { }
    
    // Working
    // def zonedevice = monitoredzones.find { it.deviceNetworkId == "dsczone001"}
    def zonedevice = monitoredzones.find { it.deviceNetworkId == zonedeviceNetworkID.toString()}
    
    //def zonedevice = monitoredzones.find { it.deviceNetworkId == alarmdeviceNetworkID}
    //def zonedevice = app.getChildDevices().find { it.deviceNetworkId == zonedeviceNetworkID }
    log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice VarZoneNetworkID: $zonedeviceNetworkID"
    log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice SingleDevice: $zonedevice.deviceNetworkId"
    //log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice SingleDevice: $zonedevice.deviceNetworkId"
	if (!zonedevice) {
		log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice Not found - Unable to update zone: $zonedeviceNetworkID"
	} 
	else {
		log.debug "DSCAlarm SmartApp - DSCOpenCloseDevice Updating zone: $zonedeviceNetworkID"
        zonedevice.updatedevicezone("${cmd}")
        //zonedevice.test("${cmd}")
	}
}


private updateAlarmDeviceType(String cmd) {
	def alarmdeviceNetworkID = "dscalarmtype"
    def alarmdevice = dscalarmtype.find { it.deviceNetworkId == alarmdeviceNetworkID}
    log.debug "DSCAlarm SmartApp - AlarmDeviceFound: $alarmdevice"
	
    if(!alarmdevice){
    	log.debug "DSCAlarm SmartApp - AlarmDevice Not found - alarmdeviceNetworkID: $alarmdeviceNetworkID"
    }
    else{
    	log.debug "DSCAlarm SmartApp - Updating alarmdevicetype: $alarmdeviceNetworkID"
        alarmdevice.dscalarmparse("${cmd}")
    }
}
