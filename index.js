#!/usr/bin/env node

var hid = require("node-hid").HID;

function kraken(opts){
	if (!(this instanceof kraken)) return new kraken(opts);

	var self = this;

	// monitor temperatures and speeds
	self.monitor = (!!opts.monitor);

	// get device
	self.device = (!!opts.device) ? new hid(0x1e71, 0x170e) : new hid(opts.device);

	// default values
	self.temp = null; // float degrees c
	self.fans = null; // rpm
	self.pump = null; // rpm

	// update values
	if (self.monitor) self.device.on("data", function(data) {
		self.temp = (data[1] + data[2]/10);
		self.fans = (data[3] << 8 | data[4]);
		self.pump = (data[5] << 8 | data[6]);
	});
	
};

// get temps and speeds
kraken.prototype.update = function(fn){
	var self = this;
	
	// when monitoring, call back with values
	if (self.monitor) return fn({
		temp: self.temp,
		fans: self.fans,
		pump: self.pump
	}), this;
	
	// otherwise get values once and call back
	self.device.once("data", function(data) {

		self.temp = (data[1] + data[2]/10);
		self.fans = (data[3] << 8 | data[4]);
		self.pump = (data[5] << 8 | data[6]);

		return fn({
			temp: self.temp,
			fans: self.fans,
			pump: self.pump
		});

	});
		
	return this;
}

// set colors, speed: 0-4
kraken.prototype.setColors = function(mode, speed, colors){
	var self = this;
	
	// check mode
	switch (mode) {
		case "solid": 
			mode = 0x00;
		break;
		case "fading": 
			mode = 0x01;
		break;
		case "spectrum": 
			mode = 0x02;
		break;
		case "radar": 
			mode = 0x03;
		break;
		case "marquee": 
			mode = 0x04;
		break;
		case "police":
			mode = 0x05;
		break;
		case "breathing": 
			mode = 0x06;
		break;
		case "pulse": 
			mode = 0x07;
		break;
		case "spinner": 
			mode = 0x08;
		break;
		case "chaser": 
			mode = 0x09;
		break;
		default:
			throw new Error("Invalid mode");
		break;
	}
	
	// check speed
	if (!speed) speed = 2; // default speed
	speed = Math.max(0,Math.min(4,speed)); // limit to 0-7

	// check colors
	if (!colors) colors = '000000'; // default all black
	if (!(colors instanceof Array)) colors = [ colors ];
	if (!(colors[0] instanceof Array)) colors = [ colors ];
	
	colors = colors.slice(0,8).map(function(col){
		if (!(col instanceof Array)) col = [ col ];
		if (!col.length === 0) col.push('000000');

		// fill array up
		while (col.length < 9) col.push(col[col.length-1]);
		 
		// convert to byte array
		return col.map(function(c,i){
			c = c.toLowerCase().replace(/[^0-9a-f]+/g,'');
			
			if (c.length !== 6) return [0,0,0]; // invalid colors get black
			
			if (i === 0 && mode !== 0x02) { // make text color grb except in spectrum
				return [
					parseInt(c.toLowerCase().slice(2,4),16), // g
					parseInt(c.toLowerCase().slice(0,2),16), // r
					parseInt(c.toLowerCase().slice(4,6),16), // b
				];
			} else {
				return [
					parseInt(c.toLowerCase().slice(0,2),16), // r
					parseInt(c.toLowerCase().slice(2,4),16), // g
					parseInt(c.toLowerCase().slice(4,6),16), // b
				];
			}
		}).reduce(function(cols,col){
			return cols.concat(col);
		},[]);
		
	});

	colors.forEach(function(col,i){

		try {
			self.device.write([0x02, 0x4c, 0x00, mode, (i<<5|speed)].concat(col));
		} catch (err) {
			throw new Error(err)
		}
		
	});
	
	return this;
};

// set fan speed 0-100
kraken.prototype.setFans = function(percent){
	var self = this;

	// check percentage
	percent = parseInt(percent,10);
	if (!percent || isNaN(percent)) throw new Error("Illegal value");
	percent = Math.min(100,Math.max(0,percent));

	self.device.write([0x02, 0x4d, 0x00, 0x00, percent, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	
	return this;
};

// set pump speed 0-100
kraken.prototype.setPump = function(percent){
	var self = this;

	// check percentage
	percent = parseInt(percent,10);
	if (!percent || isNaN(percent)) throw new Error("Illegal value");
	percent = Math.min(100,Math.max(0,percent));

	self.device.write([0x02, 0x4d, 0x40, 0x00, percent, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	
	return this;
};

// sxport
module.exports = kraken;