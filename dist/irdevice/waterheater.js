import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class WaterHeater extends irdeviceBase {
    platform;
    // Services
    Valve;
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Set category
        accessory.category = 29 /* this.hap.Categories.FAUCET */;
        // Initialize Switch Service
        accessory.context.Valve = accessory.context.Valve ?? {};
        this.Valve = {
            Name: accessory.displayName,
            Service: accessory.getService(this.hap.Service.Valve) ?? accessory.addService(this.hap.Service.Valve),
            Active: accessory.context.Active ?? this.hap.Characteristic.Active.INACTIVE,
        };
        accessory.context.Valve = this.Valve;
        this.Valve.Service.setCharacteristic(this.hap.Characteristic.Name, this.Valve.Name).setCharacteristic(this.hap.Characteristic.ValveType, this.hap.Characteristic.ValveType.GENERIC_VALVE).getCharacteristic(this.hap.Characteristic.Active).onGet(() => {
            return this.Valve.Active;
        }).onSet(this.ActiveSet.bind(this));
    }
    async ActiveSet(value) {
        this.debugLog(`Active: ${value}`);
        this.Valve.Active = value;
        if (this.Valve.Active === this.hap.Characteristic.Active.ACTIVE) {
            await this.pushWaterHeaterOnChanges();
            this.Valve.Service.setCharacteristic(this.hap.Characteristic.InUse, this.hap.Characteristic.InUse.IN_USE);
        }
        else {
            await this.pushWaterHeaterOffChanges();
            this.Valve.Service.setCharacteristic(this.hap.Characteristic.InUse, this.hap.Characteristic.InUse.NOT_IN_USE);
        }
    }
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType      Command Type    Command           Parameter           Description
     * WaterHeater     "command"       "turnOff"         "default"         set to OFF state
     * WaterHeater     "command"       "turnOn"          "default"         set to ON state
     */
    async pushWaterHeaterOnChanges() {
        this.debugLog(`pushWaterHeaterOnChanges Active: ${this.Valve.Active}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (this.Valve.Active === this.hap.Characteristic.Active.ACTIVE && !this.deviceDisablePushOn) {
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
    async pushWaterHeaterOffChanges() {
        this.debugLog(`pushWaterHeaterOffChanges Active: ${this.Valve.Active}, disablePushOff: ${this.deviceDisablePushOff}`);
        if (this.Valve.Active === this.hap.Characteristic.Active.INACTIVE && !this.deviceDisablePushOff) {
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
        await this.updateCharacteristic(this.Valve.Service, this.hap.Characteristic.Active, this.Valve.Active, 'Active');
    }
    async apiError({ e }) {
        this.Valve.Service.updateCharacteristic(this.hap.Characteristic.Active, e);
    }
}
//# sourceMappingURL=waterheater.js.map