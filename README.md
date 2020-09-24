# weather plus

Modified MagicMirror2 currentweather with new options, Pressure in mmHg,  Visibility in km, min & max temp and weather description

<img src=https://github.com/hangorazvan/weather_plus/blob/master/preview.png>
Do not make modification and do not replace the default, just add <i>disable: true</i> in config.js and use this one as 3rd party,

Then put in config.js


	{
		module: "weatherforecast_plus",
		position: "top_right",
		config: {
			showPressure: true,
			showVisibility: true,
			showMinMax: true,
			showDescription: true,
							// See weatherforeast default module 'Configuration options' for more information.
		}
	}