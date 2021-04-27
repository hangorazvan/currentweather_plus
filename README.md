# weather plus

https://github.com/hangorazvan/weather_plus

Modified MagicMirror2 currentweather based on Openweathermap with Onecall endpoint

<img src=https://github.com/hangorazvan/weather_plus/blob/master/preview.png>
Do not make modification and do not replace the default, just add <i>disable: true</i> in config.js and use this one as 3rd party, then put in config.js:


	{
		module: "weather_plus",
		position: "top_right",
		config: {
			showFeelsLike: true,
			realFeelsLike: true,
			showVisibility: true,
			showHumidity: true,
			showPressure: true,
			showDew: true,
			showUvi: true,
			showPrecip: true,
			showDescription: true,
				// See currentweather default module 'Configuration options' for more information.
		}
	}
