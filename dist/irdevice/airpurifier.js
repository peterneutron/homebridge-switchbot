import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class AirPurifier extends irdeviceBase {
    platform;
    // Services
    AirPurifier;
    TemperatureSensor;
    // Characteristic Values
    APActive;
    CurrentAPTemp;
    CurrentAPMode;
    CurrentAPFanSpeed;
    // Others
    Busy;
    Timeout = null;
    static IDLE;
    CurrentMode;
    static INACTIVE;
    LastTemperature;
    CurrentFanSpeed;
    static PURIFYING_AIR;
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Set category
        accessory.category = 19 /* this.hap.Categories.AIR_PURIFIER */;
        // Initialize AirPurifier Service
        accessory.context.AirPurifier = accessory.context.AirPurifier ?? {};
        this.AirPurifier = {
            Name: accessory.displayName,
            Service: accessory.getService(this.hap.Service.AirPurifier) ?? accessory.addService(this.hap.Service.AirPurifier),
            Active: accessory.context.Active ?? this.hap.Characteristic.Active.INACTIVE,
            RotationSpeed: accessory.context.RotationSpeed ?? 0,
            CurrentAirPurifierState: accessory.context.CurrentAirPurifierState ?? this.hap.Characteristic.CurrentAirPurifierState.INACTIVE,
            TargetAirPurifierState: accessory.context.TargetAirPurifierState ?? this.hap.Characteristic.TargetAirPurifierState.AUTO,
            CurrentHeaterCoolerState: accessory.context.CurrentHeaterCoolerState ?? this.hap.Characteristic.CurrentHeaterCoolerState.INACTIVE,
        };
        accessory.context.AirPurifier = this.AirPurifier;
        this.AirPurifier.Service.setCharacteristic(this.hap.Characteristic.Name, this.AirPurifier.Name).getCharacteristic(this.hap.Characteristic.Active).onGet(() => {
            return this.AirPurifier.Active;
        }).onSet(this.ActiveSet.bind(this));
        this.AirPurifier.Service.getCharacteristic(this.hap.Characteristic.CurrentAirPurifierState).onGet(() => {
            return this.CurrentAirPurifierStateGet();
        });
        this.AirPurifier.Service.getCharacteristic(this.hap.Characteristic.TargetAirPurifierState).onGet(() => {
            return this.AirPurifier.TargetAirPurifierState;
        }).onSet(this.TargetAirPurifierStateSet.bind(this));
        // Initialize TemperatureSensor Service
        accessory.context.TemperatureSensor = accessory.context.TemperatureSensor ?? {};
        this.TemperatureSensor = {
            Name: `${accessory.displayName} Temperature Sensor`,
            Service: accessory.getService(this.hap.Service.TemperatureSensor) ?? accessory.addService(this.hap.Service.TemperatureSensor),
            CurrentTemperature: accessory.context.CurrentTemperature || 24,
        };
        accessory.context.TemperatureSensor = this.TemperatureSensor;
        this.TemperatureSensor.Service.setCharacteristic(this.hap.Characteristic.Name, this.TemperatureSensor.Name).getCharacteristic(this.hap.Characteristic.CurrentTemperature).onGet(() => {
            return this.TemperatureSensor.CurrentTemperature;
        });
    }
    async ActiveSet(value) {
        this.debugLog(`Set Active: ${value}`);
        this.AirPurifier.Active = value;
        if (this.AirPurifier.Active === this.hap.Characteristic.Active.ACTIVE) {
            this.pushAirPurifierOnChanges();
        }
        else {
            this.pushAirPurifierOffChanges();
        }
    }
    async TargetAirPurifierStateSet(value) {
        switch (value) {
            case this.hap.Characteristic.CurrentAirPurifierState.PURIFYING_AIR:
                this.CurrentMode = AirPurifier.PURIFYING_AIR;
                break;
            case this.hap.Characteristic.CurrentAirPurifierState.IDLE:
                this.CurrentMode = AirPurifier.IDLE;
                break;
            case this.hap.Characteristic.CurrentAirPurifierState.INACTIVE:
                this.CurrentMode = AirPurifier.INACTIVE;
                break;
            default:
                break;
        }
    }
    async CurrentAirPurifierStateGet() {
        if (this.AirPurifier.Active === 1) {
            this.AirPurifier.CurrentAirPurifierState = this.hap.Characteristic.CurrentAirPurifierState.PURIFYING_AIR;
        }
        else {
            this.AirPurifier.CurrentAirPurifierState = this.hap.Characteristic.CurrentAirPurifierState.INACTIVE;
        }
        return this.AirPurifier.CurrentAirPurifierState;
    }
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType          commandType     Command          command parameter          Description
     * AirPurifier:        "command"       "turnOn"         "default"         =        every home appliance can be turned on by default
     * AirPurifier:        "command"       "turnOff"        "default"         =        every home appliance can be turned off by default
     * AirPurifier:        "command"       "swing"          "default"         =        swing
     * AirPurifier:        "command"       "timer"          "default"         =        timer
     * AirPurifier:        "command"       "lowSpeed"       "default"         =        fan speed to low
     * AirPurifier:        "command"       "middleSpeed"    "default"         =        fan speed to medium
     * AirPurifier:        "command"       "highSpeed"      "default"         =        fan speed to high
     */
    async pushAirPurifierOnChanges() {
        this.debugLog(`pushAirPurifierOnChanges Active: ${this.AirPurifier.Active}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (this.AirPurifier.Active === this.hap.Characteristic.Active.ACTIVE && !this.deviceDisablePushOn) {
            const commandType = await this.commandType();
            const command = await this.commandOn();
            const bodyChange = {
                command,
                parameter: 'default',
                commandType,
            };
            await this.pushChanges(bodyChange);
        }
    }
    async pushAirPurifierOffChanges() {
        this.debugLog(`pushAirPurifierOffChanges Active: ${this.AirPurifier.Active}, disablePushOff: ${this.deviceDisablePushOff}`);
        if (this.AirPurifier.Active === this.hap.Characteristic.Active.INACTIVE && !this.deviceDisablePushOn) {
            const commandType = await this.commandType();
            const command = await this.commandOff();
            const bodyChange = {
                command,
                parameter: 'default',
                commandType,
            };
            await this.pushChanges(bodyChange);
        }
    }
    async pushAirPurifierStatusChanges() {
        this.debugLog(`pushAirPurifierStatusChanges Active: ${this.AirPurifier.Active}, disablePushOff: ${this.deviceDisablePushOff}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (!this.Busy) {
            this.Busy = true;
            this.AirPurifier.CurrentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.IDLE;
        }
        clearTimeout(this.Timeout);
        // Make a new Timeout set to go off in 1000ms (1 second)
        this.Timeout = setTimeout(this.pushAirPurifierDetailsChanges.bind(this), 1500);
    }
    async pushAirPurifierDetailsChanges() {
        this.debugLog(`pushAirPurifierDetailsChanges Active: ${this.AirPurifier.Active}, disablePushOff: ${this.deviceDisablePushOff}, disablePushOn: ${this.deviceDisablePushOn}`);
        this.CurrentAPTemp = this.TemperatureSensor.CurrentTemperature ?? 24;
        this.CurrentAPMode = this.CurrentMode ?? 1;
        this.CurrentAPFanSpeed = this.CurrentFanSpeed ?? 1;
        this.APActive = this.AirPurifier.Active === 1 ? 'on' : 'off';
        const parameter = `${this.CurrentAPTemp},${this.CurrentAPMode},${this.CurrentAPFanSpeed},${this.APActive}`;
        const bodyChange = {
            command: 'setAll',
            parameter: `${parameter}`,
            commandType: 'command',
        };
        if (this.AirPurifier.Active === 1) {
            if ((Number(this.TemperatureSensor.CurrentTemperature) || 24) < (this.LastTemperature || 30)) {
                this.AirPurifier.CurrentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.COOLING;
            }
            else {
                this.AirPurifier.CurrentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.HEATING;
            }
        }
        else {
            this.AirPurifier.CurrentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.INACTIVE;
        }
        await this.pushChanges(bodyChange);
    }
    async pushChanges(bodyChange) {
        this.debugLog('pushChanges');
        if (this.device.connectionType === 'OpenAPI') {
            this.infoLog(`Sending request to SwitchBot API, body: ${JSON.stringify(bodyChange)}`);
            try {
                const response = await this.pushChangeRequest(bodyChange);
                const deviceStatus = response.body;
                await this.pushStatusCodes(deviceStatus);
                if (await this.successfulStatusCodes(deviceStatus)) {
                    await this.successfulPushChange(deviceStatus, bodyChange);
                    await this.updateHomeKitCharacteristics();
                }
                else {
                    await this.statusCode(deviceStatus.statusCode);
                }
            }
            catch (e) {
                await this.apiError(e);
                await this.pushChangeError(e);
            }
        }
        else {
            this.warnLog(`Connection Type: ${this.device.connectionType}, commands will not be sent to OpenAPI`);
        }
    }
    async updateHomeKitCharacteristics() {
        this.debugLog('updateHomeKitCharacteristics');
        // Active
        await this.updateCharacteristic(this.AirPurifier.Service, this.hap.Characteristic.Active, this.AirPurifier.Active, 'Active');
        // CurrentAirPurifierState
        await this.updateCharacteristic(this.AirPurifier.Service, this.hap.Characteristic.CurrentAirPurifierState, this.AirPurifier.CurrentAirPurifierState, 'CurrentAirPurifierState');
        // CurrentHeaterCoolerState
        await this.updateCharacteristic(this.AirPurifier.Service, this.hap.Characteristic.CurrentHeaterCoolerState, this.AirPurifier.CurrentHeaterCoolerState, 'CurrentHeaterCoolerState');
        // CurrentTemperature
        await this.updateCharacteristic(this.TemperatureSensor.Service, this.hap.Characteristic.CurrentTemperature, this.TemperatureSensor.CurrentTemperature, 'CurrentTemperature');
    }
    async apiError(e) {
        this.AirPurifier.Service.updateCharacteristic(this.hap.Characteristic.Active, e);
        this.AirPurifier.Service.updateCharacteristic(this.hap.Characteristic.TargetAirPurifierState, e);
        this.AirPurifier.Service.updateCharacteristic(this.hap.Characteristic.CurrentAirPurifierState, e);
        this.AirPurifier.Service.updateCharacteristic(this.hap.Characteristic.CurrentHeaterCoolerState, e);
        this.TemperatureSensor.Service.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, e);
    }
}
//# sourceMappingURL=airpurifier.js.map