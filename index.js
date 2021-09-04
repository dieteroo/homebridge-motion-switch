var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-motion-switch-with-accessoryinformation", "Motion Switch with accessoryinformation", MotionSwitchAccessorywithaccessoryinformation);
}

function MotionSwitchAccessorywithaccessoryinformation(log, config) {
  this.log = log;
  this.motionSensorName = config["motion_sensor_name"];
  this.switchName = config["switch_name"];
  this.switchState = false;
  this.motionSensorState = false;

  this.informationService = new Service.AccessoryInformation();
  this.informationService
    .setCharacteristic(Characteristic.Manufacturer, 'Homebridge')
    .setCharacteristic(Characteristic.Model, 'Motion Switch')
    .setCharacteristic(Characteristic.FirmwareRevision, '1.2.3')
    .setCharacteristic(Characteristic.SerialNumber, this.switchName.replace(/\s/g, '').toUpperCase());
  
  this.motionSensorService = new Service.MotionSensor(this.motionSensorName);
  this.motionSensorService
    .getCharacteristic(Characteristic.MotionDetected)
    .on('get', this.getMotionSensorState.bind(this));

  this.switchService = new Service.Switch(this.switchName);
  this.switchService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getSwitchState.bind(this))
    .on('set', this.setSwitchState.bind(this));
}

MotionSwitchAccessorywithaccessoryinformation.prototype.getMotionSensorState = function(callback) {
  callback(null, this.motionSensorState)
}

MotionSwitchAccessorywithaccessoryinformation.prototype.getSwitchState = function(callback) {
  callback(null, this.switchState)
}

MotionSwitchAccessorywithaccessoryinformation.prototype.setSwitchState = function(state, callback) {
  this.switchState = state

  // When we turn this on, we also want to turn on the motion sensor
  this.trigger()
  callback(null);
}

MotionSwitchAccessorywithaccessoryinformation.prototype.trigger = function() {
  if (this.switchState) {
    this.motionSensorState = 1;
    this.motionSensorService.setCharacteristic(Characteristic.MotionDetected, Boolean(this.motionSensorState));
    setTimeout(this.resetSensors, 1000, this);
  }
}

MotionSwitchAccessorywithaccessoryinformation.prototype.resetSensors = function(self) {
  self.switchState = 0
  
  self.motionSensorState = 0
  self.switchService.setCharacteristic(Characteristic.On, Boolean(self.switchState));
  self.motionSensorService.setCharacteristic(Characteristic.MotionDetected, Boolean(self.motionSensorState));
}

MotionSwitchAccessorywithaccessoryinformation.prototype.getServices = function() {
  return [this.motionSensorService, this.switchService];
  return [this.informationService, this.switchService];
}
