/**
 *  DSCOpenCloseDeviceType
 *
 *  Author: Victor Santana
 *   based on work by XXX
 *  
 *  Date: 2017-03-26
 */

// for the UI
metadata {
  definition (name: "DSCOpenCloseDeviceType", namespace: "dscalarm", author: "victor@hepoca.com") {
    // Change or define capabilities here as needed
    capability "Refresh"
    capability "Contact Sensor"
    capability "Polling"
    capability "Sensor"

    // Add commands as needed
    command "updatedevicezone"
  }

  simulator {
    // Nothing here, you could put some testing stuff here if you like
  }

  tiles {
    // Main Row
    standardTile("zone", "device.contact", width: 2, height: 2, canChangeBackground: true, canChangeIcon: true) {
      state "open",   label: '${name}', icon: "st.contact.contact.open",   backgroundColor: "#ffa81e"
      state "closed", label: '${name}', icon: "st.contact.contact.closed", backgroundColor: "#79b821"
    }

    // This tile will be the tile that is displayed on the Hub page.
    main "zone"

    // These tiles will be displayed when clicked on the device, in the order listed here.
    details(["zone"])
  }
}

// handle commands
def updatedevicezone(String cmd) {
	// state will be a valid state for a zone (open, closed)
	// zone will be a number for the zone
	log.debug "DSCAlarm OpenCloseDeviceType - Processing command: $cmd"
    def strcommand = cmd.substring(3,9).substring(0,3)
    log.debug "DSCAlarm OpenCloseDeviceType - Variable strcommand: $strcommand"
    def strcommand2 = strcommand.substring(0,3)
    log.debug "DSCAlarm OpenCloseDeviceType -  Variable strcommand2: $strcommand2"
	if(cmd.substring(3,9).substring(0,3) == "609"){
		sendEvent (name: "contact", value: "open")
		log.debug "DSCAlarm OpenCloseDeviceType - Changed to: Open"
	}
	else if (cmd.substring(3,9).substring(0,3) == "610"){
		sendEvent (name: "contact", value: "closed")
		log.debug "DSCAlarm OpenCloseDeviceType - Changed to: Close"
	}
}

def poll() {
  log.debug "DSCAlarm OpenCloseDeviceType - Executing 'poll'"
  // TODO: handle 'poll' command
  // On poll what should we do? nothing for now..
}

def refresh() {
  log.debug "DSCAlarm OpenCloseDeviceType - Executing 'refresh' which is actually poll()"
  poll()
  // TODO: handle 'refresh' command
}
