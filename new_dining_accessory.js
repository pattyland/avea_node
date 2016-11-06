var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var noble = require("noble");
var avea = require("avea_node");
var colorS = require("onecolor");

var bulb = null;
var perifSel = null;




var serviceUUID = ["f815e810456c6761746f4d756e696368"];

// enter your Avea bulb identifications below
const uuidMyLamp = "7cec79d75f47";
const sernoBulb = "475FD779EC7C"
const txtIdLamp="Esstischlampe" 

function timestamp()
{
	a = new Date();
	b = a.getHours(); c = a.getMinutes(); d = a.getSeconds();
	state = "null";
	rssi = "null";
	identity = "null";
	blb = "null"
	if(b < 10){b = '0'+b;}
	if(c < 10){c = '0'+c;}
	if(d < 10){d = '0'+d;}
	if(perifSel!=null) {
		state = perifSel.state;
		identity = perifSel.uuid;
		if(state == "connected") {
			perifSel.updateRssi(function(error, rssi){});
			rssi = perifSel.rssi;
			err = perifSel.error;
		} else rssi = " X ";
	}
	if(bulb!=null) {blb = bulb.connected};
	stamp = b+':'+c+':'+d+'|'+txtIdLamp+'('+identity+')|'+state+'|'+rssi+'|'+blb+'|';
	return stamp;
}


// Replace the ".txt" extension with ".js" and paste the file inside the accesories folder of your Hombridge instalation folder.
// Example Created by Alblahm, Nov 20th.
// Thank's to Marmelatze for the base code.
// Changelog:
// Color correspondence between ios and avea_light updated.

// Here's the hardware device that we'll expose to HomeKit 
var OFFICELIGHT = {
  powerOn: false,
  brightness: 100, // percentage
  hue: 38,
  saturation: 99,

  setPowerOn: function(onValue) { 
    OFFICELIGHT.powerOn = onValue;
    //Se modifica el estado del dispositivo ...
    OFFICELIGHT.sendToLight(onValue);
  },
  setHue: function(hue){
    //console.log("... Fijando el matiz a %s", hue);
    OFFICELIGHT.hue = hue;
    OFFICELIGHT.sendToLight(true);
  },
  setSaturation: function(saturation){
    //console.log("... Fijando la saturacion a %s", saturation);
    OFFICELIGHT.saturation = saturation;
  },
  setBrightness: function(brightness) {
    //console.log("... Fijando el brillo a %s", brightness);
    OFFICELIGHT.brightness = brightness;
  },
  sendToLight: function(posValue){
    // setColor(white,red,green,blue,TimeToSet en ms), los valores van de 0 a 4095
    if(posValue==true){
      console.log(timestamp()+"switch on");
      //console.log("... Enviando comando a la luz");
      //console.log("... Color AVEA: Hue:" + (OFFICELIGHT.hue).toString() + ", Sat:" + (OFFICELIGHT.saturation).toString() + ", Bright:" + (OFFICELIGHT.brightness).toString());
      var myHsbColor = colorS('hsv(' + (OFFICELIGHT.hue).toString() + ',' + (OFFICELIGHT.saturation).toString() + ',' + (OFFICELIGHT.brightness).toString() +')');
      //console.log("... Color  RGB: RED:" + Math.floor(myHsbColor.red()*255).toString() + ", GREEN:" + Math.floor(myHsbColor.green()*255).toString() + ", BLUE:" + Math.floor(myHsbColor.blue()*255).toString());
      var rComp="0x" + Math.floor(Math.min(4095,(myHsbColor.red()*4096))).toString(16).toUpperCase();
      var gComp="0x" + Math.floor(Math.min(4095,(myHsbColor.green()*4096))).toString(16).toUpperCase();
      var bComp="0x" + Math.floor(Math.min(4095,(myHsbColor.blue()*4096))).toString(16).toUpperCase();
      var iComp="0x" + Math.floor(Math.min(4095,(Math.max(0,(OFFICELIGHT.brightness-30))*4096)/100)).toString(16).toUpperCase();
      bulb.setColor(new avea.Color(iComp, rComp, gComp, bComp), 0x0ff);
    }else{
      console.log(timestamp()+"switch off");
      bulb.setColor(new avea.Color(0x000, 0x000, 0x000, 0x000), 0x5ff);
    }

  },
  identify: function() {
    console.log(timestamp()+"Identify");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "OFFICELIGHT".
//var lightUUID = uuid.generate('hap-nodejs:accessories:OFFICELIGHT');
var lightUUID = uuid.generate('hap-nodejs:accessories' + uuidMyLamp);

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Office Light', lightUUID);


// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "FF:FF:FF:FF:FF:1A";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Elgato")
  .setCharacteristic(Characteristic.Model, "Avea Bulb")
  .setCharacteristic(Characteristic.SerialNumber, sernoBulb);

// listen for the "identify" event for this Accessory
light
  .on('identify', function(paired, callback) {
     OFFICELIGHT.identify();
     callback(); // success
  });

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, txtIdLamp) // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    if(perifSel!=null){
	//console.log("... Click -> Perif: " + perifSel.state + " / Luz: " + bulb.connected);
	if(value==true){
	   //console.log("switch on %d!", txtIdLamp);
	}else{
	   //console.log("switch off %s!", txtIdLamp);
	}
	// Ahora se hace la solicitud a la función si está conectado el leBT
	if((perifSel.state == "connected") && (bulb.connected==true)){
    	   OFFICELIGHT.setPowerOn(value);
    	   callback();
	   // Our fake Light is synchronous - this value has been successfully set
	}else{
	   console.log(timestamp());
	   noble.startScanning(serviceUUID, false);
	   OFFICELIGHT.setPowerOn(value);
	   callback();
	}
    }else{
      console.log(timestamp()+"Device not Ready");
      callback(new Error("Device not Ready"));
    }
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    
    var err = null; // in case there were any problems
    // Ahora se hace la solicitud a la función si está conectado el leBT
    if(perifSel!=null){
      // Se lee el valor actual de data devuelto por Promise, que contendrá algo como: 
      // { current: Color { white: 0, red: 0, green: 0, blue: 0 }, target: Color { white: 0, red: 0, green: 0, blue: 0 } }
      if((perifSel.state == "connected") && (bulb.connected==true)){
    	Promise.resolve(bulb.getColor()).then((data) => {
	   var bCheckColor=((data.target.white==0)&&(data.target.red==0)&&(data.target.green==0)&&(data.target.blue==0));
	   //console.log(data.target);
	   if (bCheckColor == true){
		console.log(timestamp()+"off");
		OFFICELIGHT.powerOn = false;
		callback(err, false);
	   }else{
		console.log(timestamp()+"on");
		OFFICELIGHT.powerOn = true;
		//OFFICELIGHT.brightness = parseInt(data.current.white)*100/4096;
		callback(err, true, OFFICELIGHT.brightness);
	   }
    	}).catch(e => {
           console.log(e);
    	});
      } else {
		console.log(timestamp());
		noble.startScanning(serviceUUID, false);
    	Promise.resolve(bulb.getColor()).then((data) => {
	   var bCheckColor=((data.target.white==0)&&(data.target.red==0)&&(data.target.green==0)&&(data.target.blue==0));
	   //console.log(data.target);
	   if (bCheckColor == true){
		console.log(timestamp()+"off");
		OFFICELIGHT.powerOn = false;
		callback(err, false);
	   }else{
		console.log(timestamp()+"on");
		OFFICELIGHT.powerOn = true;
		//OFFICELIGHT.brightness = parseInt(data.current.white)*100/4096;
		callback(err, true, OFFICELIGHT.brightness);
	   }
    	}).catch(e => {
           console.log(e);
    	});
      }
    }else{
      console.log(timestamp()+"Device not Ready");
      callback(new Error("Device not Ready"));
    }

  });

// also add an "optional" Characteristic for Brightness
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('get', function(callback) {
     if(perifSel!=null){
     	//console.log("... El brillo de %s estaba fijado a %s", txtIdLamp, OFFICELIGHT.brightness);
     	callback(null, OFFICELIGHT.brightness);
     }else{
	callback(new Error("Device not Ready"));
     }
  })
  .on('set', function(value, callback) {
     console.log(timestamp()+"brightness: %s", value);
     if(perifSel!=null){
       // Ahora se hace la solicitud a la función si está conectado el leBT
       if((perifSel.state == "connected") && (bulb.connected==true)){
    	   OFFICELIGHT.setBrightness(value);
    	   callback();
	   // Our fake Light is synchronous - this value has been successfully set
       }else{
	   console.log(timestamp()+"reconnection initiated to set brightness...");
	   noble.startScanning(serviceUUID, false);
	   OFFICELIGHT.setBrightness(value);
	   callback();
       }
     }else{
	callback(new Error("Device not Ready"));
     }
  });

// also add an "optional" Characteristic for hue
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Hue)
  .on('get',function(callback){
     if(perifSel!=null){
     	console.log(timestamp()+"get hue: %s", OFFICELIGHT.hue);
     	callback(null, OFFICELIGHT.hue);
     }else{
	callback(new Error("Device not Ready"));
     }
   })
   .on('set',function(value,callback){
     console.log(timestamp()+"set hue: %s", value);
     if(perifSel!=null){
       // Ahora se hace la solicitud a la función si está conectado el leBT
       if((perifSel.state == "connected") && (bulb.connected==true)){
    	   OFFICELIGHT.setHue(value);
    	   callback();
	   // Our fake Light is synchronous - this value has been successfully set
       }else{
	   console.log(timestamp()+"reconnection initiated to set hue...");
	   noble.startScanning(serviceUUID, false);
	   OFFICELIGHT.setHue(value);
	   callback();
       }
     }else{
	callback(new Error("Device not Ready"));
     }
   });

// also add an "optional" Characteristic for saturation
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Saturation)
  .on('get',function(callback){
     if(perifSel!=null){
     	console.log(timestamp()+"get saturdation: %s", OFFICELIGHT.saturation);
     	callback(null, OFFICELIGHT.saturation);
     }else{
	callback(new Error("Device not Ready"));
     }
   })
   .on('set',function(value,callback){
     console.log(timestamp()+"set saturdation: %s", value);
     if(perifSel!=null){
       // Ahora se hace la solicitud a la función si está conectado el leBT
       if((perifSel.state == "connected") && (bulb.connected==true)){
    	   OFFICELIGHT.setSaturation(value);
    	   callback();
	   // Our fake Light is synchronous - this value has been successfully set
       }else{
	   console.log(timestamp()+"reconnection initiated to set saturdation...");
	   noble.startScanning(serviceUUID, false);
	   OFFICELIGHT.setSaturation(value);
	   callback();
       }
     }else{
	callback(new Error("Device not Ready"));
     }
   });

// Mas info del paquete noble en: https://www.npmjs.com/package/noble
noble.on("discover", function(peripheral) {
	// La primera vez se conecta al dispositivo identificado y se crea una nueva luz Avea... 
	if(perifSel==null){
		console.log(timestamp()+"discovered "+peripheral.uuid);
		if((peripheral.uuid==uuidMyLamp)||(uuidMyLamp==null)){
			perifSel=peripheral;
			console.log(timestamp()+"uuid matches *****");
			//console.log("... (Init) Perif: " + );
			//perifSel.connect(function(error) {
				//console.log('... (Init) conectando el dispositivo: ' + perifSel.uuid);
				bulb = new avea.Avea(perifSel);
				bulb.connect();
				console.log(timestamp()+"bulb.connect was called...");
			//});
		}
		// De ahí en adelante tan solo se reconecta la luz y ya conecta el dispositivo al hacerlo
	} else {
		console.log(timestamp()+"discovered "+peripheral.uuid);
		if(peripheral.uuid==uuidMyLamp){
			console.log(timestamp()+"lost bulb appears again!")
		} else {
			console.log(timestamp()+"nothing important to me...");
			//noble.startScanning(serviceUUID, false);
		}
	}
});

// Tras iniciar el programa cambia el estado del servicio a poweredOn, y se lanza un scan de dispositivos
noble.on('stateChange', function(state) {
  // possible state values: "unknown", "resetting", "unsupported", "unauthorized", "poweredOff", "poweredOn"
  console.log(timestamp()+"noble: %s", state);
  if (state === 'poweredOn') {
      	noble.startScanning(serviceUUID, false);
	} else {
        noble.stopScanning();
  }
});
//
// Here we show the list of Siri voice commands accepted with this accessory file.
// ***********************************************************************************
// The name asigned in the ios home app to this sample device is "Lámpara de Pie" and it is placed in a room called "Comedor" for the spanish version, 
// if you use any other  name or room use the name assigned instead of the name shown here. This section is only informative, there is no code here, so 
// any change inside this section do not affect the behaviour of the ios home app.
// --------------------------------------------------
//  Accessory room(english): "living-room"
//  Accessory room(spanish): "Comedor"
//   Accessory room(german): "Wohnzimmer"
//      Accessory room(...): "****"
// --------------------------------------------------
//  Accessory name(english): "lamp"
//  Accessory name(spanish): "Lámpara de Pie"
//   Accessory name(german): "Lampe"
//      Accessory name(...): "*****"
// --------------------------------------------------
//       Command 1(english): "turn on the living room lamp"
//       Command 1(spanish): "Enciende la lampara de pie del comedor"
//        Command 1(german): "Wohnzimmer Lampe einschalten"
// --------------------------------------------------
//       Command 2(english): "turn off the living room lamp"
//       Command 2(spanish): "Apaga la lampara de pie del comedor"
//        Command 3(german): "Wohnzimmer Lampe ausschalten"
// --------------------------------------------------
//       Command 3(english): change the brightness of the living room lamp to 50
//       Command 3(spanish): Cambia el brillo de la Lámpara de Pie a 50
//        Command 3(german): "Wohnzimmer Lampe 30%"
// --------------------------------------------------
//       Command 4(english): change the color of the living room lamp to red
//       Command 4(spanish): Cambia el color de la Lámpara de Pie a rojo
//        Command 4(german): "Licht der Wohnzimmerlampe grün / blau / gelb / orange / pink"
// --------------------------------------------------
