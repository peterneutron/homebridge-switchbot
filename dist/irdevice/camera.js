import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Camera extends irdeviceBase {
    platform;
    // Services
    Switch;
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Set category
        accessory.category = 17 /* this.hap.Categories.CAMERA */;
        // Initialize Switch Service
        accessory.context.Switch = accessory.context.Switch ?? {};
        this.Switch = {
            Name: accessory.displayName,
            Service: accessory.getService(this.hap.Service.Switch) ?? accessory.addService(this.hap.Service.Switch),
            On: accessory.context.On ?? false,
        };
        accessory.context.Switch = this.Switch;
        this.Switch.Service.setCharacteristic(this.hap.Characteristic.Name, this.Switch.Name).getCharacteristic(this.hap.Characteristic.On).onGet(() => {
            return this.Switch.On;
        }).onSet(this.OnSet.bind(this));
    }
    async OnSet(value) {
        this.debugLog(`On: ${value}`);
        this.Switch.On = value;
        if (this.Switch.On) {
            this.pushOnChanges();
        }
        else {
            this.pushOffChanges();
        }
    }
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType    commandType     Command           command parameter           Description
     * Camera -        "command"       "turnOff"         "default"          =        set to OFF state
     * Camera -        "command"       "turnOn"          "default"          =        set to ON state
     * Camera -        "command"       "volumeAdd"       "default"          =        volume up
     * Camera -        "command"       "volumeSub"       "default"          =        volume down
     * Camera -        "command"       "channelAdd"      "default"          =        next channel
     * Camera -        "command"       "channelSub"      "default"          =        previous channel
     */
    async pushOnChanges() {
        this.debugLog(`pushOnChanges On: ${this.Switch.On}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (this.Switch.On && !this.deviceDisablePushOn) {
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
    async pushOffChanges() {
        this.debugLog(`pushOffChanges On: ${this.Switch.On}, disablePushOff: ${this.deviceDisablePushOff}`);
        if (!this.Switch.On && !this.deviceDisablePushOff) {
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
        await this.updateCharacteristic(this.Switch.Service, this.hap.Characteristic.On, this.Switch.On, 'On');
    }
    async apiError(e) {
        this.Switch.Service.updateCharacteristic(this.hap.Characteristic.On, e);
    }
}
//# sourceMappingURL=camera.js.map