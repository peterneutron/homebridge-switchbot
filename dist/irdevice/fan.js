import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class IRFan extends irdeviceBase {
    platform;
    // Services
    Fan;
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Set category
        accessory.category = 3 /* this.hap.Categories.FAN */;
        // Initialize Switch Service
        accessory.context.Fan = accessory.context.Fan ?? {};
        this.Fan = {
            Name: accessory.displayName,
            Service: accessory.getService(this.hap.Service.Fanv2) ?? accessory.addService(this.hap.Service.Fanv2),
            Active: accessory.context.Active ?? this.hap.Characteristic.Active.INACTIVE,
            SwingMode: accessory.context.SwingMode ?? this.hap.Characteristic.SwingMode.SWING_DISABLED,
            RotationSpeed: accessory.context.RotationSpeed ?? 0,
            RotationDirection: accessory.context.RotationDirection ?? this.hap.Characteristic.RotationDirection.CLOCKWISE,
        };
        accessory.context.Fan = this.Fan;
        this.Fan.Service.setCharacteristic(this.hap.Characteristic.Name, this.Fan.Name).getCharacteristic(this.hap.Characteristic.Active).onGet(() => {
            return this.Fan.Active;
        }).onSet(this.ActiveSet.bind(this));
        if (device.rotation_speed) {
            // handle Rotation Speed events using the RotationSpeed characteristic
            this.Fan.Service.getCharacteristic(this.hap.Characteristic.RotationSpeed).setProps({
                minStep: device.set_minStep ?? 1,
                minValue: device.set_min ?? 1,
                maxValue: device.set_max ?? 100,
            }).onGet(() => {
                return this.Fan.RotationSpeed;
            }).onSet(this.RotationSpeedSet.bind(this));
        }
        else if (this.Fan.Service.testCharacteristic(this.hap.Characteristic.RotationSpeed) && !device.swing_mode) {
            const characteristic = this.Fan.Service.getCharacteristic(this.hap.Characteristic.RotationSpeed);
            this.Fan.Service.removeCharacteristic(characteristic);
            this.debugLog('Rotation Speed Characteristic was removed.');
        }
        else {
            this.debugLog(`RotationSpeed Characteristic was not removed/added, Clear Cache on ${this.accessory.displayName} to remove Chracteristic`);
        }
        if (device.swing_mode) {
            // handle Osolcation events using the SwingMode characteristic
            this.Fan.Service.getCharacteristic(this.hap.Characteristic.SwingMode).onGet(() => {
                return this.Fan.SwingMode;
            }).onSet(this.SwingModeSet.bind(this));
        }
        else if (this.Fan.Service.testCharacteristic(this.hap.Characteristic.SwingMode) && !device.swing_mode) {
            const characteristic = this.Fan.Service.getCharacteristic(this.hap.Characteristic.SwingMode);
            this.Fan.Service.removeCharacteristic(characteristic);
            this.debugLog('Swing Mode Characteristic was removed.');
        }
        else {
            this.debugLog(`Swing Mode Characteristic was not removed/added, Clear Cache on ${this.accessory.displayName} To Remove Chracteristic`);
        }
    }
    async SwingModeSet(value) {
        this.debugLog(`SwingMode: ${value}`);
        if (value > this.Fan.SwingMode) {
            this.Fan.SwingMode = 1;
            await this.pushFanOnChanges();
            await this.pushFanSwingChanges();
        }
        else {
            this.Fan.SwingMode = 0;
            await this.pushFanOnChanges();
            await this.pushFanSwingChanges();
        }
        this.Fan.SwingMode = value;
        this.accessory.context.SwingMode = this.Fan.SwingMode;
    }
    async RotationSpeedSet(value) {
        this.debugLog(`RotationSpeed: ${value}`);
        if (value > this.Fan.RotationSpeed) {
            this.Fan.RotationSpeed = 1;
            this.pushFanSpeedUpChanges();
            this.pushFanOnChanges();
        }
        else {
            this.Fan.RotationSpeed = 0;
            this.pushFanSpeedDownChanges();
        }
        this.Fan.RotationSpeed = value;
        this.accessory.context.RotationSpeed = this.Fan.RotationSpeed;
    }
    async ActiveSet(value) {
        this.debugLog(`Active: ${value}`);
        this.Fan.Active = value;
        if (this.Fan.Active === this.hap.Characteristic.Active.ACTIVE) {
            this.pushFanOnChanges();
        }
        else {
            this.pushFanOffChanges();
        }
    }
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType  commandType     Command           command parameter           Description
     * Fan -        "command"       "swing"          "default"          =        swing
     * Fan -        "command"       "timer"          "default"          =        timer
     * Fan -        "command"       "lowSpeed"       "default"          =        fan speed to low
     * Fan -        "command"       "middleSpeed"    "default"          =        fan speed to medium
     * Fan -        "command"       "highSpeed"      "default"          =        fan speed to high
     */
    async pushFanOnChanges() {
        this.debugLog(`pushFanOnChanges Active: ${this.Fan.Active}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (this.Fan.Active === this.hap.Characteristic.Active.ACTIVE && !this.deviceDisablePushOn) {
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
    async pushFanOffChanges() {
        this.debugLog(`pushLightOffChanges Active: ${this.Fan.Active}, disablePushOff: ${this.deviceDisablePushOff}`);
        if (this.Fan.Active === this.hap.Characteristic.Active.INACTIVE && !this.deviceDisablePushOff) {
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
    async pushFanSpeedUpChanges() {
        const bodyChange = {
            command: 'highSpeed',
            parameter: 'default',
            commandType: 'command',
        };
        await this.pushChanges(bodyChange);
    }
    async pushFanSpeedDownChanges() {
        const bodyChange = {
            command: 'lowSpeed',
            parameter: 'default',
            commandType: 'command',
        };
        await this.pushChanges(bodyChange);
    }
    async pushFanSwingChanges() {
        const bodyChange = {
            command: 'swing',
            parameter: 'default',
            commandType: 'command',
        };
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
        await this.updateCharacteristic(this.Fan.Service, this.hap.Characteristic.Active, this.Fan.Active, 'Active');
        // SwingMode
        await this.updateCharacteristic(this.Fan.Service, this.hap.Characteristic.SwingMode, this.Fan.SwingMode, 'SwingMode');
        // RotationSpeed
        await this.updateCharacteristic(this.Fan.Service, this.hap.Characteristic.RotationSpeed, this.Fan.RotationSpeed, 'RotationSpeed');
    }
    async apiError(e) {
        this.Fan.Service.updateCharacteristic(this.hap.Characteristic.Active, e);
        this.Fan.Service.updateCharacteristic(this.hap.Characteristic.RotationSpeed, e);
        this.Fan.Service.updateCharacteristic(this.hap.Characteristic.SwingMode, e);
    }
}
//# sourceMappingURL=fan.js.map