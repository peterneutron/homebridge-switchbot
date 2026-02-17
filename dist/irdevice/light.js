import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Light extends irdeviceBase {
    platform;
    // Services
    LightBulb;
    ProgrammableSwitchOn;
    ProgrammableSwitchOff;
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Set category
        accessory.category = 5 /* this.hap.Categories.LIGHTBULB */;
        if (!device.stateless) {
            // Initialize LightBulb Service
            accessory.context.LightBulb = accessory.context.LightBulb ?? {};
            this.LightBulb = {
                Name: accessory.displayName,
                Service: accessory.getService(this.hap.Service.Lightbulb) ?? accessory.addService(this.hap.Service.Lightbulb),
                On: accessory.context.On || false,
            };
            accessory.context.LightBulb = this.LightBulb;
            this.LightBulb.Service.setCharacteristic(this.hap.Characteristic.Name, this.LightBulb.Name).getCharacteristic(this.hap.Characteristic.On).onGet(() => {
                return this.LightBulb.On;
            }).onSet(this.OnSet.bind(this));
        }
        else {
            // Initialize ProgrammableSwitchOn Service
            accessory.context.ProgrammableSwitchOn = accessory.context.ProgrammableSwitchOn ?? {};
            this.ProgrammableSwitchOn = {
                Name: `${accessory.displayName} On`,
                Service: accessory.getService(this.hap.Service.StatefulProgrammableSwitch) ?? accessory.addService(this.hap.Service.StatefulProgrammableSwitch),
                ProgrammableSwitchEvent: accessory.context.ProgrammableSwitchEvent ?? this.hap.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                ProgrammableSwitchOutputState: accessory.context.ProgrammableSwitchOutputState ?? 0,
            };
            accessory.context.ProgrammableSwitchOn = this.ProgrammableSwitchOn;
            // Initialize ProgrammableSwitchOn Characteristics
            this.ProgrammableSwitchOn?.Service.setCharacteristic(this.hap.Characteristic.Name, this.ProgrammableSwitchOn.Name).getCharacteristic(this.hap.Characteristic.ProgrammableSwitchEvent).setProps({
                validValueRanges: [0, 0],
                minValue: 0,
                maxValue: 0,
                validValues: [0],
            }).onGet(() => {
                return this.ProgrammableSwitchOn.ProgrammableSwitchEvent;
            });
            this.ProgrammableSwitchOn?.Service.getCharacteristic(this.hap.Characteristic.ProgrammableSwitchOutputState).onGet(() => {
                return this.ProgrammableSwitchOn.ProgrammableSwitchOutputState;
            }).onSet(this.ProgrammableSwitchOutputStateSetOn.bind(this));
            // Initialize ProgrammableSwitchOff Service
            accessory.context.ProgrammableSwitchOff = accessory.context.ProgrammableSwitchOff ?? {};
            this.ProgrammableSwitchOff = {
                Name: `${accessory.displayName} Off`,
                Service: accessory.getService(this.hap.Service.StatefulProgrammableSwitch) ?? accessory.addService(this.hap.Service.StatefulProgrammableSwitch),
                ProgrammableSwitchEvent: accessory.context.ProgrammableSwitchEvent ?? this.hap.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                ProgrammableSwitchOutputState: accessory.context.ProgrammableSwitchOutputState ?? 0,
            };
            accessory.context.ProgrammableSwitchOff = this.ProgrammableSwitchOff;
            // Initialize ProgrammableSwitchOff Characteristics
            this.ProgrammableSwitchOff?.Service.setCharacteristic(this.hap.Characteristic.Name, this.ProgrammableSwitchOff.Name).getCharacteristic(this.hap.Characteristic.ProgrammableSwitchEvent).setProps({
                validValueRanges: [0, 0],
                minValue: 0,
                maxValue: 0,
                validValues: [0],
            }).onGet(() => {
                return this.ProgrammableSwitchOff.ProgrammableSwitchEvent;
            });
            this.ProgrammableSwitchOff?.Service.getCharacteristic(this.hap.Characteristic.ProgrammableSwitchOutputState).onGet(() => {
                return this.ProgrammableSwitchOff.ProgrammableSwitchOutputState;
            }).onSet(this.ProgrammableSwitchOutputStateSetOff.bind(this));
        }
    }
    async OnSet(value) {
        this.debugLog(`On: ${value}`);
        this.LightBulb.On = value;
        if (this.LightBulb?.On) {
            const On = true;
            await this.pushLightOnChanges(On);
        }
        else {
            const On = false;
            await this.pushLightOffChanges(On);
        }
        /**
         * pushLightOnChanges and pushLightOffChanges above assume they are measuring the state of the accessory BEFORE
         * they are updated, so we are only updating the accessory state after calling the above.
         */
    }
    async ProgrammableSwitchOutputStateSetOn(value) {
        this.debugLog(`On: ${value}`);
        this.ProgrammableSwitchOn.ProgrammableSwitchOutputState = value;
        if (this.ProgrammableSwitchOn?.ProgrammableSwitchOutputState === 1) {
            const On = true;
            await this.pushLightOnChanges(On);
        }
        /**
         * pushLightOnChanges and pushLightOffChanges above assume they are measuring the state of the accessory BEFORE
         * they are updated, so we are only updating the accessory state after calling the above.
         */
    }
    async ProgrammableSwitchOutputStateSetOff(value) {
        this.debugLog(`On: ${value}`);
        this.ProgrammableSwitchOff.ProgrammableSwitchOutputState = value;
        if (this.ProgrammableSwitchOff?.ProgrammableSwitchOutputState === 1) {
            const On = false;
            await this.pushLightOffChanges(On);
        }
        /**
         * pushLightOnChanges and pushLightOffChanges above assume they are measuring the state of the accessory BEFORE
         * they are updated, so we are only updating the accessory state after calling the above.
         */
    }
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType    commandType     Command          command parameter           Description
     * Light -       "command"       "turnOff"         "default"          =        set to OFF state
     * Light -       "command"       "turnOn"          "default"          =        set to ON state
     * Light -       "command"       "volumeAdd"       "default"          =        volume up
     * Light -       "command"       "volumeSub"       "default"          =        volume down
     * Light -       "command"       "channelAdd"      "default"          =        next channel
     * Light -       "command"       "channelSub"      "default"          =        previous channel
     */
    async pushLightOnChanges(On) {
        this.debugLog(`pushLightOnChanges On: ${On}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (On === true && this.deviceDisablePushOn === false) {
            const commandType = await this.commandType();
            const command = await this.commandOn();
            const bodyChange = {
                command,
                parameter: 'default',
                commandType,
            };
            await this.pushChanges(bodyChange, On);
        }
    }
    async pushLightOffChanges(On) {
        this.debugLog(`pushLightOffChanges On: ${On}, disablePushOff: ${this.deviceDisablePushOff}`);
        if (On === false && this.deviceDisablePushOff === false) {
            const commandType = await this.commandType();
            const command = await this.commandOff();
            const bodyChange = {
                command,
                parameter: 'default',
                commandType,
            };
            await this.pushChanges(bodyChange, On);
        }
    }
    async pushChanges(bodyChange, On) {
        this.debugLog('pushChanges');
        if (this.device.connectionType === 'OpenAPI') {
            this.infoLog(`Sending request to SwitchBot API, body: ${JSON.stringify(bodyChange)}`);
            try {
                const response = await this.pushChangeRequest(bodyChange);
                const deviceStatus = response.body;
                await this.pushStatusCodes(deviceStatus);
                if (await this.successfulStatusCodes(deviceStatus)) {
                    await this.successfulPushChange(deviceStatus, bodyChange);
                    this.accessory.context.On = On;
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
        if (!this.device.stateless && this.LightBulb?.Service) {
            // On
            await this.updateCharacteristic(this.LightBulb.Service, this.hap.Characteristic.On, this.LightBulb.On, 'On');
        }
        else {
            if (this.ProgrammableSwitchOn?.Service) {
                // On Stateful Programmable Switch
                await this.updateCharacteristic(this.ProgrammableSwitchOn.Service, this.hap.Characteristic.ProgrammableSwitchOutputState, this.ProgrammableSwitchOn.ProgrammableSwitchOutputState, 'ProgrammableSwitchOutputState');
            }
            if (this.ProgrammableSwitchOff?.Service) {
                // Off Stateful Programmable Switch
                await this.updateCharacteristic(this.ProgrammableSwitchOff.Service, this.hap.Characteristic.ProgrammableSwitchOutputState, this.ProgrammableSwitchOff.ProgrammableSwitchOutputState, 'ProgrammableSwitchOutputState');
            }
        }
    }
    async apiError(e) {
        if (!this.device.stateless) {
            this.LightBulb?.Service.updateCharacteristic(this.hap.Characteristic.On, e);
        }
        else {
            this.ProgrammableSwitchOn?.Service.updateCharacteristic(this.hap.Characteristic.ProgrammableSwitchEvent, e);
            this.ProgrammableSwitchOn?.Service.updateCharacteristic(this.hap.Characteristic.ProgrammableSwitchOutputState, e);
            this.ProgrammableSwitchOff?.Service.updateCharacteristic(this.hap.Characteristic.ProgrammableSwitchEvent, e);
            this.ProgrammableSwitchOff?.Service.updateCharacteristic(this.hap.Characteristic.ProgrammableSwitchOutputState, e);
        }
    }
}
//# sourceMappingURL=light.js.map