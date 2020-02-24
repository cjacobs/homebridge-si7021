const Si7021 = require('si7021-sensor')

var Accessory, Service, Characteristic, UUIDGen

module.exports = function (homebridge) {
    console.log("homebridge API version: " + homebridge.version);

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerAccessory("homebridge-si7021", "si7021Sensor", Si7021Platform);
}

// Accessory c'tor
class Si7021Platform {
    constructor(log, config) {
        this.log = log
        this.name = config.name
        this.currentTemperatureC = 0
        this.currentHumidity = 0
        this.sensor = new Si7021()
    }

    identify(callback) {
        this.log('Identify')
        callback(null)
    }

    startReadLoop() {
        const callback = () => {
            setTimeout(() => this.readData(callback), 5000)
        }

        this.readData(callback)
    }

    readData(callback) {
        this.sensor.readSensorData().then((data) => {
            this.currentHumidity = data.humidity
            this.currentTemperatureC = data.temperature_C
        }).catch((err) => {
            this.currentHumidity = Math.round(Math.random() * 100);
            this.currentTemperatureC = Math.round(Math.random() * 10);
            this.log(`Error reading data: ${err}`)
        });
    }

    getServices() {
        const informationService = new Service.AccessoryInformation();
    
        informationService
          .setCharacteristic(Characteristic.Manufacturer, 'floydsoft')
          .setCharacteristic(Characteristic.Model, 'si7021 Temperature and Humidity Sensor')
          .setCharacteristic(Characteristic.SerialNumber, 'none');
    
        // Set up the services
        this.humidityService = new Service.HumiditySensor(this.name);
        this.humidityService
          .getCharacteristic(Characteristic.CurrentRelativeHumidity)
          .on('get', (callback) => {
            callback(null, this.currentHumidity);
          });
        this.humidityService
          .getCharacteristic(Characteristic.Name)
          .on('get', callback => {
            callback(null, this.name);
          });

        this.temperatureService = new Service.TemperatureSensor(this.name);
        this.temperatureService
          .getCharacteristic(Characteristic.CurrentTemperature)
          .on('get', (callback) => {
            callback(null, this.currentTemperatureC);
          });
        this.temperatureService
          .getCharacteristic(Characteristic.Name)
          .on('get', callback => {
            callback(null, this.name);
          });

        // Begin reading info
        this.startReadLoop();
    
        return [informationService, this.humidityService, this.temperatureService];
      }
}
