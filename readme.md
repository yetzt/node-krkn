# krkn

nzxt kraken x52/x62 usb interface controller library

## usage

``` javascript

var kraken = require("krkn")({ monitor: true });

// read temperature, fan speed and pump speed
kraken.update(function(data){
	
	console.log("temp: ", data.temp);
	console.log("fans: ", data.fans);
	console.log("pump: ", data.pump);
	
});

// set fan speed, 0-100%
kraken.setFans(100);

// set pump speed, 0-100%
kraken.setPump(100);

// set colors (mode, speed 0-7, colors)
kraken.setColors('breathing', 1, [ // col[0] text, col[1-8] ring; 1-8 rows, depending on mode
	[ '#ffffff', '#cc0033', '#dd0033', '#ee0033', '#ff0033', '#ff0033', '#ee0033', '#dd0033', '#cc0033'], 
	[ '#ffffff', '#cc0099', '#dd0099', '#ee0099', '#ff0099', '#ff0099', '#ee0099', '#dd0099', '#cc0099'], 
	[ '#ffffff', '#ff0099', '#ee0099', '#dd0099', '#cc0099', '#cc0099', '#dd0099', '#ee0099', '#ff0099'], 
	[ '#ffffff', '#ff0033', '#ee0033', '#dd0033', '#cc0033', '#cc0033', '#dd0033', '#ee0033', '#ff0033'],
]);

```

## modes

`solid` - 1 text + 1-8 ring, 1 row
`fading` - 0 text + 1 ring, 1-8 rows
`spectrum` - colors ignored
`radar` - 1 text, 1-8 ring, 1 row
`marquee` - 1 text, 1 ring, 1-8 rows
`police` - 1 text, 2 ring, 1 row
`breathing` - 1 text, 1-8 ring, 1-8 rows
`pulse` - 1 text, 1-8 ring, 1-8 rows
`spinner` - 1 text, 1-8 ring, 1 row, only colors 1+4 used
`chaser` - colors ignored, might get stuck
