Module.register("weather_plus",{
	defaults: {
		location: false,
		locationID: false,
		appid: "",
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		showPeriod: true,
		showPeriodUpper: false,
		showWindDirection: true,
		showWindDirectionAsArrow: false,
		useBeaufort: false,
		useKMPHwind: true,
		lang: config.language,
		decimalSymbol: ".",
		showSun: true,
		degreeLabel: true,
		showIndoorTemperature: false,
		showIndoorHumidity: false,
		showFeelsLike: true,
		realFeelsLike: true,

		showPressure: true,
		showVisibility: true,
		showHumidity: true,
		showMinMax: true,
		showDescription: true,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,

		apiVersion: "2.5",
		apiBase: "https://api.openweathermap.org/data/",
		weatherEndpoint: "weather",

		appendLocationNameToHeader: true,
		calendarClass: "calendar",
		tableClass: "large",

		onlyTemp: false,
		hideTemp: false,
		roundTemp: false,
		iconTable: {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-day-cloudy-windy",
			"09d": "wi-day-showers",
			"10d": "wi-day-rain",
			"11d": "wi-day-thunderstorm",
			"13d": "wi-day-snow",
			"50d": "wi-day-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-alt-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy-windy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		},
	},

	firstEvent: true,
	fetchedLocationName: config.location,

	getScripts: function () {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function () {
		return ["weather_plus.css", "weather-icons.css"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.sunriseSunsetTime = null;
		this.sunriseSunsetIcon = null;
		this.temperature = null;
		this.indoorTemperature = null;
		this.indoorHumidity = null;
		this.weatherType = null;
		this.feelsLike = null;
		this.minTemp = null;			// min temperature.
		this.maxTemp = null;			// max temperature.
		this.desc = null;	 			// weather description.
		this.rain = null;	 			// rain.
		this.snow = null;	 			// snow.
		this.pressure = null;	 		// main pressure.
		this.visibility = null;	 		// visibility.
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	// add extra information of current weather
	// windDirection, humidity, sunrise and sunset
	addExtraInfoWeather: function (wrapper) {
		var small = document.createElement("div");
		small.className = "normal xmedium wis";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind dimmed";
		small.appendChild(windIcon);

		var windSpeed = document.createElement("span");
		if (this.windSpeed > 50 && this.windSpeed < 75) {
			windSpeed.className = "wisw lightblue";
		} else if (this.windSpeed > 75 && this.windSpeed < 100) {
			windSpeed.className = "wisw yellow";
		} else if (this.windSpeed > 100) {
			windSpeed.className = "wisw coral";
		} else windSpeed.className = "wisw";
		windSpeed.innerHTML = " " + this.windSpeed + "<span class=\"subs\"> km/h</span>";
		small.appendChild(windSpeed);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("span");
			windDirection.className = "sups";
			if (this.config.showWindDirectionAsArrow) {
				if (this.windDeg !== null) {
					windDirection.innerHTML = '<i class="fa fa-long-arrow-down" style="transform:rotate(' + this.windDeg + 'deg);"></i>';
				}
			} else {
				windDirection.innerHTML = this.translate(this.windDirection);
			}
			small.appendChild(windDirection);
		}

		if (this.config.showPressure) {
			var pressureIcon = document.createElement("span");
			pressureIcon.className = "wi wi-thermometer dimmed";
			small.appendChild(pressureIcon);

			var pressure = document.createElement("span"); 			// main pressure.
			var atpressure = Math.round(this.pressure * 750.062 / 1000)
				if (atpressure < 745) {
				    pressure.className = "pressure lightblue";
				} else if (atpressure > 775) {
				    pressure.className = "pressure yellow";
				} else pressure.className = "pressure";
			pressure.innerHTML = Math.round(this.pressure * 750.062 / 1000) + "<span class=\"subs\"> Hg</span><span class=\"sups\">mm</span>";
			small.appendChild(pressure);
		}

		if (this.config.showVisibility) {
			var visibilityIcon = document.createElement("span");
			visibilityIcon.className = "wi wi-alien dimmed";
			small.appendChild(visibilityIcon);

			var visibility = document.createElement("span"); 			// visibility.
			visibility.className = "visibility";
			visibility.innerHTML = this.visibility / 1000 + "<span class=\"subs\"> km</span> ";
			small.appendChild(visibility);
		}
//		var spacer = document.createElement("span");
//		spacer.innerHTML = "&nbsp;";
//		small.appendChild(spacer);

		if (this.config.showHumidity) {
			var humidityIcon = document.createElement("span");
			humidityIcon.className = "wi wi-humidity humidityIcon";
			humidityIcon.innerHTML = "";
			
			var humidity = document.createElement("span");
			if (this.humidity < 30) {
			    humidity.className = "wish lightblue";
			} else if (this.humidity > 50 && this.humidity < 80) {
			    humidity.className = "wish yellow";
			} else if (this.humidity > 80) {
			    humidity.className = "wish coral";
			} else humidity.className = "wish";
			humidity.innerHTML = this.humidity + "%";
			small.appendChild(humidityIcon);
			small.appendChild(humidity);
		}

		if (this.config.showSun) {
			var sunriseSunsetIcon = document.createElement("span");
			sunriseSunsetIcon.className = "wi dimmed " + this.sunriseSunsetIcon;
			small.appendChild(sunriseSunsetIcon);

			var sunriseSunsetTime = document.createElement("span");
			sunriseSunsetTime.innerHTML = " " + this.sunriseSunsetTime;
			small.appendChild(sunriseSunsetTime);
		}

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.tableClass;

		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.onlyTemp === false) {
			this.addExtraInfoWeather(wrapper);
		}

		var large = document.createElement("div");
		large.className = "light";

		var degreeLabel = "";
		if (this.config.units === "metric" || this.config.units === "imperial") {
			degreeLabel;
		}
		if (this.config.degreeLabel) {
			switch (this.config.units) {
				case "metric":
					degreeLabel += "C";
					break;
				case "imperial":
					degreeLabel += "F";
					break;
				case "default":
					degreeLabel += "K";
					break;
			}
		}

		if (this.config.decimalSymbol === "") {
			this.config.decimalSymbol = ".";
		}

		if (this.config.hideTemp === false) {
			var weatherIcon = document.createElement("span");
			weatherIcon.className = "wicon wi weathericon " + this.weatherType;
			large.appendChild(weatherIcon);

			var temperature = document.createElement("span");
			temperature.className = "wtemp bright light xlarge";
			temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;<span class=\"deg shade\">" + degreeLabel + "</span>";
			large.appendChild(temperature);
		}

		if (this.config.showIndoorTemperature && this.indoorTemperature) {
			var indoorIcon = document.createElement("span");
			indoorIcon.className = "fa fa-home";
			large.appendChild(indoorIcon);

			var indoorTemperatureElem = document.createElement("span");
			indoorTemperatureElem.className = "bright";
			indoorTemperatureElem.innerHTML = " " + this.indoorTemperature.replace(".", this.config.decimalSymbol) + degreeLabel;
			large.appendChild(indoorTemperatureElem);
		}

		if (this.config.showIndoorHumidity && this.indoorHumidity) {
			var indoorHumidityIcon = document.createElement("span");
			indoorHumidityIcon.className = "fa fa-tint";
			large.appendChild(indoorHumidityIcon);

			var indoorHumidityElem = document.createElement("span");
			indoorHumidityElem.className = "bright";
			indoorHumidityElem.innerHTML = " " + this.indoorHumidity + "%";
			large.appendChild(indoorHumidityElem);
		}

		wrapper.appendChild(large);

		if (this.config.showFeelsLike && this.config.onlyTemp === false) {
			var small = document.createElement("div");
			small.className = "normal medium rfd ";

			var feelsLike = document.createElement("span");
					if (this.config.units == "metric") {
				if (this.feelsLike == -0) {this.feelsLike = 0}
				if (this.feelsLike >= 45) {
					feelsLike.className = "real redrf";
				} else if (this.feelsLike >= 40 && this.feelsLike < 45) {
					feelsLike.className = "real orangered";
				} else if (this.feelsLike >= 35 && this.feelsLike < 40) {
					feelsLike.className = "real tomato";
				} else if (this.feelsLike >= 30 && this.feelsLike < 35) {
					feelsLike.className = "real coral";
				} else if (this.feelsLike >= 25 && this.feelsLike < 30) {
					feelsLike.className = "real darkorange";
				} else if (this.feelsLike >= 20 && this.feelsLike < 25) {
					feelsLike.className = "real gold";
				} else if (this.feelsLike >= 15 && this.feelsLike < 20) {
					feelsLike.className = "real yellow";
				} else if (this.feelsLike >= 10 && this.feelsLike < 15) {
					feelsLike.className = "real greenyellow";
				} else if (this.feelsLike >= 5 && this.feelsLike < 10) {
					feelsLike.className = "real chartreuse";
				} else if (this.feelsLike >= 0 && this.feelsLike < 5) {
					feelsLike.className = "real lawngreen";
				} else if (this.feelsLike >= -5 && this.feelsLike < 0) {
					feelsLike.className = "real lime";
				} else if (this.feelsLike >= -10 && this.feelsLike < -5) {
					feelsLike.className = "real powderblue";
				} else if (this.feelsLike >= -15 && this.feelsLike < -10) {
					feelsLike.className = "real lightblue";
				} else if (this.feelsLike >= -20 && this.feelsLike < -15) {
					feelsLike.className = "real skyblue";
				} else if (this.feelsLike >= -25 && this.feelsLike < -20) {
					feelsLike.className = "real lightskyblue";
				} else if (this.feelsLike >= -30 && this.feelsLike < -25) {
					feelsLike.className = "real deepskyblue";
				} else if (this.feelsLike < 30) {
					feelsLike.className = "real dodgerblue";
				}
			} else feelsLike.className = "dimmed real";

			feelsLike.innerHTML = "<span class=normal> În " + this.fetchedLocationName + " " + this.translate("FEELS") + "</span> " + this.feelsLike + "&deg;" + degreeLabel;
			small.appendChild(feelsLike);

			if (this.config.showDescription) {
				var description = document.createElement("div"); 		// weather description.
				description.className = "dimmed descr";
				description.innerHTML = "La ora: " + moment().format("HH:mm") + ": <span class=bright>" + this.desc + "</span>";
				small.appendChild(description);
			}

			if (this.config.showMinMax) {
				var maxTemp = document.createElement("span"); 			// max temperature.
				maxTemp.className = "maxTemp mmx";
				maxTemp.innerHTML = "<span class=\"lime\">" + this.translate("NOW") + ":&nbsp; </span><span class=\"minMax\">max.</span>&nbsp;" + this.roundValue(this.maxTemp.toFixed(1).replace(".", this.config.decimalSymbol)) + "&deg;" + degreeLabel;
				small.appendChild(maxTemp);
	    		
				var minTemp = document.createElement("span"); 			// min temperature.
				minTemp.className = "minTemp mmx";
				minTemp.innerHTML = "&nbsp; <span class=\"minMax\">min.</span>&nbsp;" + this.roundValue(this.minTemp.toFixed(1).replace(".", this.config.decimalSymbol)) + "&deg;" + degreeLabel;
				small.appendChild(minTemp);

				var rains = document.createElement("span"); 			// rain. not working, under construction
				rains.className = "mmx";
				if ((isNaN(this.rain)) || (isNaN(this.snow))) {
					rains.innerHTML = "&nbsp; <i class=\"wi wi-small-craft-advisory lime\"></i>&nbsp;" + this.translate("No rain");
				} else if (isNaN(this.rain)) {
					rains.innerHTML = "&nbsp; <i class=\"wi wi-snowflake-cold lightblue\"></i>&nbsp;" + this.snow.toFixed(1).replace(".", this.config.decimalSymbol) + "&nbsp;mm";
				} else if (isNaN(this.snow)) {
					rains.innerHTML = "&nbsp; <i class=\"wi wi-umbrella yellow\"></i>&nbsp;" + this.rain.toFixed(1).replace(".", this.config.decimalSymbol) + "&nbsp;mm";
				}
				small.appendChild(rains);
			}
			wrapper.appendChild(small);
		}

		return wrapper;
	},

	// Override getHeader method.
	getHeader: function () {
		if (this.config.useLocationAsHeader && this.config.location !== false) {
			return this.config.location;
		}

		if (this.config.appendLocationNameToHeader) {
			if (this.data.header) return this.data.header + " " + this.fetchedLocationName;
			else return this.fetchedLocationName;
		}

		return this.data.header ? this.data.header : "";
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, { lockString: this.identifier });
			}
		}
		if (notification === "CALENDAR_EVENTS") {
			var senderClasses = sender.data.classes.toLowerCase().split(" ");
			if (senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1) {
				this.firstEvent = false;

				for (var e in payload) {
					var event = payload[e];
					if (event.location || event.geo) {
						this.firstEvent = event;
					//	Log.log("First upcoming event with location: ", event);
						break;
					}
				}
			}
		}
		if (notification === "INDOOR_TEMPERATURE") {
			this.indoorTemperature = this.roundValue(payload);
			this.updateDom(this.config.animationSpeed);
		}
		if (notification === "INDOOR_HUMIDITY") {
			this.indoorHumidity = this.roundValue(payload);
			this.updateDom(this.config.animationSpeed);
		}
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function () {
		if (this.config.appid === "") {
			Log.error("CurrentWeather: APPID not set!");
			return;
		}

		var url = this.config.apiBase + this.config.apiVersion + "/" + this.config.weatherEndpoint + this.getParams();
		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function () {
		var params = "?";
		if (this.config.locationID) {
			params += "id=" + this.config.locationID;
		} else if (this.config.location) {
			params += "q=" + this.config.location;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon;
		} else if (this.firstEvent && this.firstEvent.location) {
			params += "q=" + this.firstEvent.location;
		} else {
			this.hide(this.config.animationSpeed, { lockString: this.identifier });
			return;
		}

		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;

		return params;
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function (data) {
		if (!data || !data.main || typeof data.main.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.humidity = parseFloat(data.main.humidity);
		this.temperature = this.roundValue(data.main.temp);
		this.fetchedLocationName = data.name;
		this.feelsLike = 0;
		this.desc = data.weather[0].description;		// weather description.
		this.pressure = data.main.pressure;				// main pressure.
		this.visibility = data.visibility;				// visibility.
		this.minTemp = data.main.temp_min;				// min temperature.
		this.maxTemp = data.main.temp_max;				// max temperature.
		this.rain = data.rain;	//parseFloat(data.rain[1h]);		// rain.
		this.snow = data.snow;	//parseFloat(data.snow[1h]);		// snow.

		if (this.config.useBeaufort) {
			this.windSpeed = this.ms2Beaufort(this.roundValue(data.wind.speed));
		} else if (this.config.useKMPHwind) {
			this.windSpeed = parseFloat((data.wind.speed * 60 * 60) / 1000).toFixed(0);
		} else {
			this.windSpeed = parseFloat(data.wind.speed).toFixed(0);
		}

		// ONLY WORKS IF TEMP IN C //
		var windInMph = parseFloat(data.wind.speed * 2.23694);

		var tempInF = 0;
		switch (this.config.units) {
			case "metric":
				tempInF = 1.8 * this.temperature + 32;
				break;
			case "imperial":
				tempInF = this.temperature;
				break;
			case "default":
				tempInF = 1.8 * (this.temperature - 273.15) + 32;
				break;
		}

		if (this.config.realFeelsLike) {
			this.feelsLike = parseFloat(data.main.feels_like).toFixed(0);
		} else if (windInMph > 3 && tempInF < 50) {
			// windchill
			var windChillInF = Math.round(35.74 + 0.6215 * tempInF - 35.75 * Math.pow(windInMph, 0.16) + 0.4275 * tempInF * Math.pow(windInMph, 0.16));
			var windChillInC = (windChillInF - 32) * (5 / 9);

			switch (this.config.units) {
				case "metric":
					this.feelsLike = windChillInC.toFixed(0);
					break;
				case "imperial":
					this.feelsLike = windChillInF.toFixed(0);
					break;
				case "default":
					this.feelsLike = (windChillInC + 273.15).toFixed(0);
					break;
			}
		} else if (tempInF > 80 && this.humidity > 40) {
			// heat index
			var Hindex =
				-42.379 +
				2.04901523 * tempInF +
				10.14333127 * this.humidity -
				0.22475541 * tempInF * this.humidity -
				6.83783 * Math.pow(10, -3) * tempInF * tempInF -
				5.481717 * Math.pow(10, -2) * this.humidity * this.humidity +
				1.22874 * Math.pow(10, -3) * tempInF * tempInF * this.humidity +
				8.5282 * Math.pow(10, -4) * tempInF * this.humidity * this.humidity -
				1.99 * Math.pow(10, -6) * tempInF * tempInF * this.humidity * this.humidity;

			switch (this.config.units) {
				case "metric":
					this.feelsLike = parseFloat((Hindex - 32) / 1.8).toFixed(0);
					break;
				case "imperial":
					this.feelsLike = Hindex.toFixed(0);
					break;
				case "default":
					var tc = parseFloat((Hindex - 32) / 1.8) + 273.15;
					this.feelsLike = tc.toFixed(0);
					break;
			}
		} else {
			this.feelsLike = parseFloat(this.temperature).toFixed(0);
		}
		
		this.windDirection = this.deg2Cardinal(data.wind.deg);
		this.windDeg = data.wind.deg;
		this.weatherType = this.config.iconTable[data.weather[0].icon];

		var now = new Date();
		var sunrise = new Date(data.sys.sunrise * 1000);
		var sunset = new Date(data.sys.sunset * 1000);

		// The moment().format('h') method has a bug on the Raspberry Pi.
		// So we need to generate the timestring manually.
		// See issue: https://github.com/MichMich/MagicMirror/issues/181
		var sunriseSunsetDateObject = sunrise < now && sunset > now ? sunset : sunrise;
		var timeString = moment(sunriseSunsetDateObject).format("HH:mm");
		if (this.config.timeFormat !== 24) {
			//var hours = sunriseSunsetDateObject.getHours() % 12 || 12;
			if (this.config.showPeriod) {
				if (this.config.showPeriodUpper) {
					//timeString = hours + moment(sunriseSunsetDateObject).format(':mm A');
					timeString = moment(sunriseSunsetDateObject).format("h:mm A");
				} else {
					//timeString = hours + moment(sunriseSunsetDateObject).format(':mm a');
					timeString = moment(sunriseSunsetDateObject).format("h:mm a");
				}
			} else {
				//timeString = hours + moment(sunriseSunsetDateObject).format(':mm');
				timeString = moment(sunriseSunsetDateObject).format("h:mm");
			}
		}

		this.sunriseSunsetTime = timeString;
		this.sunriseSunsetIcon = sunrise < now && sunset > now ? "wi-sunset" : "wi-sunrise";

		if (!this.loaded) {
			this.show(this.config.animationSpeed, { lockString: this.identifier });
			this.loaded = true;
		}
		this.updateDom(this.config.animationSpeed);
		this.sendNotification("CURRENTWEATHER_DATA", { data: data });
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function () {
			self.updateWeather();
		}, nextLoad);
	},

	/* ms2Beaufort(ms)
	 * Converts m2 to beaufort (windspeed).
	 *
	 * see:
	 *  https://www.spc.noaa.gov/faq/tornado/beaufort.html
	 *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
	 *
	 * argument ms number - Windspeed in m/s.
	 *
	 * return number - Windspeed in beaufort.
	 */
	ms2Beaufort: function (ms) {
		var kmh = (ms * 60 * 60) / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	deg2Cardinal: function (deg) {
		if (deg > 11.25 && deg <= 33.75) {
			return "NNE";
		} else if (deg > 33.75 && deg <= 56.25) {
			return "NE";
		} else if (deg > 56.25 && deg <= 78.75) {
			return "ENE";
		} else if (deg > 78.75 && deg <= 101.25) {
			return "E";
		} else if (deg > 101.25 && deg <= 123.75) {
			return "ESE";
		} else if (deg > 123.75 && deg <= 146.25) {
			return "SE";
		} else if (deg > 146.25 && deg <= 168.75) {
			return "SSE";
		} else if (deg > 168.75 && deg <= 191.25) {
			return "S";
		} else if (deg > 191.25 && deg <= 213.75) {
			return "SSW";
		} else if (deg > 213.75 && deg <= 236.25) {
			return "SW";
		} else if (deg > 236.25 && deg <= 258.75) {
			return "WSW";
		} else if (deg > 258.75 && deg <= 281.25) {
			return "W";
		} else if (deg > 281.25 && deg <= 303.75) {
			return "WNW";
		} else if (deg > 303.75 && deg <= 326.25) {
			return "NW";
		} else if (deg > 326.25 && deg <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	},

	/* function(temperature)
	 * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
	 *
	 * argument temperature number - Temperature.
	 *
	 * return string - Rounded Temperature.
	 */
	roundValue: function (temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		return parseFloat(temperature).toFixed(decimals);
	}
});
