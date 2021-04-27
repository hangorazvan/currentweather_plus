/* Magic Mirror
 * Module: CurrentWeather
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("weather_plus", {
	// Default module config.
	defaults: {
		lat: config.latitude,
		lon: config.longitude,
		appid: config.appid2,
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: config.animation,
		timeFormat: config.timeFormat,
		showPeriod: config.period,
		showPeriodUpper: config.period,
		showWindDirection: true,
		showWindDirectionAsArrow: true,
		useBeaufort: false,
		useKMPHwind: true,
		lang: config.language,
		decimalSymbol: config.decimal,
		showHumidity: false,
		showSun: false,
		degreeLabel: config.scale,
		showIndoorTemperature: false,
		showIndoorHumidity: false,
		showFeelsLike: true,
		realFeelsLike: true,
		showVisibility: true,
		showHumidity: true,
		showPressure: true,
		showDew: true,
		showUvi: true,
		showPrecip: true,
		showDescription: true,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: config.delay,

		apiVersion: config.apiVersion,
		apiBase: config.apiBase,
		weatherEndpoint: "onecall",
		type: "current",

		appendLocationNameToHeader: false,
		useLocationAsHeader: false,

		calendarClass: "calendar",
		tableClass: "medium",

		onlyTemp: false,
		hideTemp: false,
		roundTemp: config.roundTemp,

		iconTable: {
			"01d": "day-sunny",
			"02d": "day-cloudy",
			"03d": "cloudy",
			"04d": "cloudy-windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night-clear",
			"02n": "night-cloudy",
			"03n": "night-cloudy",
			"04n": "night-cloudy",
			"09n": "night-showers",
			"10n": "night-rain",
			"11n": "night-thunderstorm",
			"13n": "night-snow",
			"50n": "night-alt-cloudy-windy"
		}
	},

	// create a variable for the first upcoming calendar event. Used if no location is specified.
	firstEvent: true,

	// create a variable to hold the location name based on the API result.
	fetchedLocationName: config.location,

	// Define required scripts.
	getScripts() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles() {
		return ["weather_plus.css", "font-awesome.css", "weather-icons.css"];
	},

	// Define required translations.
	getTranslations() {
		return {
			en: "en.json",
			ro: "ro.json"
		};
	},

	// Define start sequence.
	start() {
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
		this.dew = null;				// dew point.
		this.uvi = null;				// uv index.
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
	addExtraInfoWeather(wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind";
		small.appendChild(windIcon);

		var windSpeed = document.createElement("span");
		if (this.windSpeed > 50 && this.windSpeed < 75) {
			windSpeed.className = "lightblue";
		} else if (this.windSpeed > 75 && this.windSpeed < 100) {
			windSpeed.className = "yellow";
		} else if (this.windSpeed > 100) {
			windSpeed.className = "coral";
		} else windSpeed.className = " ";
		windSpeed.innerHTML = " " + this.windSpeed;
		small.appendChild(windSpeed);

		var windSpeedUnit = document.createElement("span");
		windSpeedUnit.className = "subs";
		windSpeedUnit.innerHTML = " km/h";
		small.appendChild(windSpeedUnit);

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

		var spacer = document.createElement("span");
		spacer.innerHTML = " &nbsp; ";
		small.appendChild(spacer);

		if (this.config.showPressure) {
			var pressureIcon = document.createElement("span");
			pressureIcon.className = "wi wi-thermometer";
			small.appendChild(pressureIcon);

			var pressure = document.createElement("span"); 			// main pressure.
			var atpressure = Math.round(this.pressure * 750.062 / 1000)
				if (atpressure < 745) {
				    pressure.className = "pressure lightblue";
				} else if (atpressure > 775) {
				    pressure.className = "pressure yellow";
				} else pressure.className = "pressure";
			pressure.innerHTML = " " + Math.round(this.pressure * 750.062 / 1000);
			small.appendChild(pressure);

			var pressureSub = document.createElement("span");
			pressureSub.className = "subs";
			pressureSub.innerHTML = " Hg";
			small.appendChild(pressureSub);

			var pressureSup = document.createElement("span");
			pressureSup.className = "sups";
			pressureSup.innerHTML = "mm";
			small.appendChild(pressureSup);
		}

		if (this.config.showVisibility) {
			var visibilityIcon = document.createElement("span");
			visibilityIcon.className = "fa fa-binoculars";
			small.appendChild(visibilityIcon);

			var visibility = document.createElement("span"); 			// visibility.
			visibility.className = "visibility";
			visibility.innerHTML = this.visibility / 1000;
			small.appendChild(visibility);

			var visibilityUnit = document.createElement("span");
			visibilityUnit.className = "subs";
			visibilityUnit.innerHTML = " km";
			small.appendChild(visibilityUnit);
		}

		var spacer = document.createElement("span");
		spacer.innerHTML = " &nbsp;";
		small.appendChild(spacer);

		if (this.config.showHumidity) {
			var humidityIcon = document.createElement("span");
			humidityIcon.className = "wi wi-humidity humidityIcon";
			humidityIcon.innerHTML = "";
			small.appendChild(humidityIcon);

			var humidity = document.createElement("span");
			if (this.humidity < 30) {
			    humidity.className = "lightblue";
			} else if (this.humidity > 50 && this.humidity < 80) {
			    humidity.className = "yellow";
			} else if (this.humidity > 80) {
			    humidity.className = "coral";
			} else humidity.className = " ";
			humidity.innerHTML = " " + this.humidity + "%";
			small.appendChild(humidity);
		}

		if (this.config.showSun) {
			var sunriseSunsetIcon = document.createElement("span");
			sunriseSunsetIcon.className = "wi" + this.sunriseSunsetIcon;
			small.appendChild(sunriseSunsetIcon);

			var sunriseSunsetTime = document.createElement("span");
			sunriseSunsetTime.innerHTML = " " + this.sunriseSunsetTime;
			small.appendChild(sunriseSunsetTime);
		}

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom() {
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
			weatherIcon.className = "wi weathericon wi-" + this.weatherType;
			large.appendChild(weatherIcon);

			var temperature = document.createElement("span");
			temperature.className = "bright light xlarge";
			if (this.temperature == -0) {this.temperature = 0}
			temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;<span class=\"deg\">" + degreeLabel + "</span>";
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
			small.className = "normal medium";

			var feelsLike = document.createElement("div");
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

			feelsLike.innerHTML = this.translate("FEELS") + this.feelsLike + "&deg;" + degreeLabel;
			small.appendChild(feelsLike);
		}

		if (this.config.showDew) {
			var dew = document.createElement("span"); 			// dew point.
			dew.className = "small dew";
			dew.innerHTML = this.translate("DEW") + this.dew.toFixed(1) + "&deg;" + degreeLabel;
			small.appendChild(dew);
		}

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		if (this.config.showUvi) {
			var uvi = document.createElement("span"); 			// uv index.
			uvi.className = "small uvi";
			uvi.innerHTML = this.translate("UVI") + this.uvi.toFixed(1);
			small.appendChild(uvi);
		}

		if (this.config.showPrecip) {
			var spacer = document.createElement("span");
			spacer.innerHTML = "&nbsp;";
			small.appendChild(spacer);

			var prepIcon = document.createElement("div");
			prepIcon.className = "wi wi-raindrop";
			small.appendChild(prepIcon);

			var precipitation = document.createElement("span");	// precipitation under construction
			precipitation.className = "small";
			if (this.precipitation > 0) {
				if(config.units === "imperial") {
					precipitation.innerHTML = " " + (this.precipitation / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in";
				} else {
					precipitation.innerHTML = " " + this.precipitation.toFixed(1).replace(".", this.config.decimalSymbol) + " mm";
				}
			} else {
				precipitation.innerHTML = " " + this.translate("No prep");
			}
			small.appendChild(precipitation);
		}

		if (this.config.showDescription) {
			var description = document.createElement("div"); 	// weather description.
			description.className = "bright medium";
			description.innerHTML = this.desc;
			small.appendChild(description);
		}

		wrapper.appendChild(small);

		return wrapper;
	},

	// Override getHeader method.
	getHeader() {
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
	notificationReceived(notification, payload, sender) {
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
	updateWeather() {
		if (this.config.appid === "") {
			Log.error("CurrentWeather: APPID not set!");
			return;
		}

		var url = this.config.apiBase + this.config.apiVersion + this.config.weatherEndpoint + this.getParams();
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
	getParams() {
		var params = "?";
		if (this.config.lat && this.config.lon) {
			params += "lat=" + this.config.lat + "&lon=" + this.config.lon;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon;
		} else {
			this.hide(this.config.animationSpeed, { lockString: this.identifier });
			return;
		}

		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;

        if (this.config.type === "current") {
            params += "&exclude=minutely,hourly,daily";
        }
        else if (this.config.type === "hourly") {
            params += "&exclude=current,minutely,daily";
        }
        else if (this.config.type === "daily") {
            params += "&exclude=current,minutely,hourly";
        }
        else {
            params += "&exclude=minutely";
        }

		return params;
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather(data) {
		if (!data || !data.current || typeof data.current.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.humidity = parseFloat(data.current.humidity);
		this.temperature = this.roundValue(data.current.temp);
		this.feelsLike = 0;
		this.desc = data.current.weather[0].description;	// weather description.
		this.pressure = data.current.pressure;				// main pressure.
		this.visibility = data.current.visibility;			// visibility.
		this.dew = data.current.dew_point;					// dew point.
		this.uvi = data.current.uvi;						// uv index.
		var precip = false;
		if (!data.current.hasOwnProperty("rain") && !data.current.hasOwnProperty("snow")) {
			this.precipitation = 0;
			precip = false;
		}
		if (data.current.hasOwnProperty("rain") && !isNaN(data.current["rain"]["1h"])) {
			this.rain = data.current["rain"]["1h"];
			precip = true;
		}
		if (data.current.hasOwnProperty("snow") && !isNaN(data.current["snow"]["1h"])) {
			this.snow = data.current["snow"]["1h"];
			precip = true;
		}
		if (precip) {
			this.precipitation = this.rain + this.snow;
		}

		if (this.config.useBeaufort) {
			this.windSpeed = this.ms2Beaufort(this.roundValue(data.current.wind_speed));
		} else if (this.config.useKMPHwind) {
			this.windSpeed = parseFloat((data.current.wind_speed * 60 * 60) / 1000).toFixed(0);
		} else {
			this.windSpeed = parseFloat(data.current.wind_speed).toFixed(0);
		}

		// ONLY WORKS IF TEMP IN C //
		var windInMph = parseFloat(data.current.wind_speed * 2.23694);

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
			this.feelsLike = parseFloat(data.current.feels_like).toFixed(0);
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
		
		this.windDirection = this.deg2Cardinal(data.current.wind_deg);
		this.windDeg = data.wind_deg;
		this.weatherType = this.config.iconTable[data.current.weather[0].icon];

		var now = new Date();
		var sunrise = new Date(data.current.sunrise * 1000);
		var sunset = new Date(data.current.sunset * 1000);

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
		this.sendNotification("CURRENTWEATHER_TYPE", { type: this.config.iconTable[data.current.weather[0].icon].replace("-", "_") });
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate(delay) {
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
	ms2Beaufort(ms) {
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

	deg2Cardinal(deg) {
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
	roundValue(temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		var roundValue = parseFloat(temperature).toFixed(decimals);
		return roundValue === "-0" ? 0 : roundValue;
	}
});