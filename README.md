# weather plus

https://github.com/hangorazvan/weather_plus

Modified MagicMirror2 currentweather module based on Openweathermap with Onecall endpoint
<br>This module is no longer maintained, will not have any improvements or bug fixes.

<img src=https://github.com/hangorazvan/weather_plus/blob/master/preview.png>
Do not make modification and do not replace the default, just add <i>disabled: true</i> in config.js and use this one as 3rd party, then put in config.js:

	{
		module: "weather", 
		position: "top_right",
		disabled: true,
		config: {
		// no needed anyore
		}
	}, 
	{
		module: "weather_plus",
		position: "top_right",
		disabled: false,        // not necessary
		config: {
		// you cand skip these options, they are true by default
			showFeelsLike: true,
			realFeelsLike: true,
			showVisibility: true,
			showHumidity: true,
			showPressure: true,
			showDew: true,
			showUvi: true,
			showPrecip: true,
			showDescription: true,
		// Here put all your info. See currentweather default module 'Configuration options' for more information.
			lat: "",	// your location latitude,
			lon: "",	// your location longitude,
			appid: "",	// your openweathermap API key,
			location: "", 	// no needed,
			locationID: "",	// no needed
		}
	},
