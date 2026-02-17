import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class TV extends irdeviceBase {
    platform;
    // Services
    Television;
    TelevisionSpeaker;
    // Characteristic Values
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Initialize Television Service
        accessory.context.Television = accessory.context.Television ?? {};
        this.Television = {
            Name: accessory.displayName,
            ConfiguredName: accessory.displayName,
            Service: accessory.getService(this.hap.Service.Television) ?? accessory.addService(this.hap.Service.Television),
            Active: accessory.context.Active ?? this.hap.Characteristic.Active.INACTIVE,
            ActiveIdentifier: accessory.context.ActiveIdentifier ?? 1,
            SleepDiscoveryMode: accessory.context.SleepDiscoveryMode ?? this.hap.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE,
            RemoteKey: accessory.context.RemoteKey ?? this.hap.Characteristic.RemoteKey.EXIT,
        };
        accessory.context.Television = this.Television;
        switch (device.remoteType) {
            case 'Speaker':
            case 'DIY Speaker':
                accessory.category = 26 /* this.hap.Categories.SPEAKER */;
                break;
            case 'IPTV':
            case 'DIY IPTV':
                accessory.category = 36 /* this.hap.Categories.TV_STREAMING_STICK */;
                break;
            case 'DVD':
            case 'DIY DVD':
            case 'Set Top Box':
            case 'DIY Set Top Box':
                accessory.category = 35 /* this.hap.Categories.TV_SET_TOP_BOX */;
                break;
            default:
                accessory.category = 31 /* this.hap.Categories.TELEVISION */;
        }
        this.Television.Service.setCharacteristic(this.hap.Characteristic.SleepDiscoveryMode, this.hap.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE).setCharacteristic(this.hap.Characteristic.ConfiguredName, this.Television.ConfiguredName).getCharacteristic(this.hap.Characteristic.ConfiguredName);
        this.Television.Service.setCharacteristic(this.hap.Characteristic.ActiveIdentifier, 1).getCharacteristic(this.hap.Characteristic.Active).onGet(() => {
            return this.Television.Active;
        }).onSet(this.ActiveSet.bind(this));
        this.Television.Service.getCharacteristic(this.hap.Characteristic.ActiveIdentifier).onGet(() => {
            return this.Television.ActiveIdentifier;
        }).onSet(this.ActiveIdentifierSet.bind(this));
        this.Television.Service.getCharacteristic(this.hap.Characteristic.RemoteKey).onGet(() => {
            return this.Television.RemoteKey;
        }).onSet(this.RemoteKeySet.bind(this));
        // Initialize TelevisionSpeaker Service
        accessory.context.TelevisionSpeaker = accessory.context.TelevisionSpeaker ?? {};
        this.TelevisionSpeaker = {
            Name: `${accessory.displayName} Speaker`,
            Service: accessory.getService(this.hap.Service.TelevisionSpeaker) ?? accessory.addService(this.hap.Service.TelevisionSpeaker),
            Active: accessory.context.Active ?? false,
            VolumeControlType: accessory.context.VolumeControlType ?? this.hap.Characteristic.VolumeControlType.ABSOLUTE,
            VolumeSelector: accessory.context.VolumeSelector ?? this.hap.Characteristic.VolumeSelector.INCREMENT,
        };
        accessory.context.TelevisionSpeaker = this.TelevisionSpeaker;
        this.TelevisionSpeaker.Service.setCharacteristic(this.hap.Characteristic.Name, this.TelevisionSpeaker.Name).setCharacteristic(this.hap.Characteristic.Active, this.hap.Characteristic.Active.ACTIVE).setCharacteristic(this.hap.Characteristic.VolumeControlType, this.hap.Characteristic.VolumeControlType.ABSOLUTE).getCharacteristic(this.hap.Characteristic.VolumeSelector).onGet(() => {
            return this.TelevisionSpeaker.VolumeSelector;
        }).onSet(this.VolumeSelectorSet.bind(this));
    }
    async VolumeSelectorSet(value) {
        this.debugLog(`VolumeSelector: ${value}`);
        if (value === this.hap.Characteristic.VolumeSelector.INCREMENT) {
            this.pushVolumeUpChanges();
        }
        else {
            this.pushVolumeDownChanges();
        }
    }
    async RemoteKeySet(value) {
        switch (value) {
            case this.hap.Characteristic.RemoteKey.REWIND: {
                this.debugLog('Set Remote Key Pressed: REWIND');
                break;
            }
            case this.hap.Characteristic.RemoteKey.FAST_FORWARD: {
                this.debugLog('Set Remote Key Pressed: FAST_FORWARD');
                break;
            }
            case this.hap.Characteristic.RemoteKey.NEXT_TRACK: {
                this.debugLog('Set Remote Key Pressed: NEXT_TRACK');
                break;
            }
            case this.hap.Characteristic.RemoteKey.PREVIOUS_TRACK: {
                this.debugLog('Set Remote Key Pressed: PREVIOUS_TRACK');
                break;
            }
            case this.hap.Characteristic.RemoteKey.ARROW_UP: {
                this.debugLog('Set Remote Key Pressed: ARROW_UP');
                // this.pushUpChanges();
                break;
            }
            case this.hap.Characteristic.RemoteKey.ARROW_DOWN: {
                this.debugLog('Set Remote Key Pressed: ARROW_DOWN');
                // this.pushDownChanges();
                break;
            }
            case this.hap.Characteristic.RemoteKey.ARROW_LEFT: {
                this.debugLog('Set Remote Key Pressed: ARROW_LEFT');
                // this.pushLeftChanges();
                break;
            }
            case this.hap.Characteristic.RemoteKey.ARROW_RIGHT: {
                this.debugLog('Set Remote Key Pressed: ARROW_RIGHT');
                // this.pushRightChanges();
                break;
            }
            case this.hap.Characteristic.RemoteKey.SELECT: {
                this.debugLog('Set Remote Key Pressed: SELECT');
                // this.pushOkChanges();
                break;
            }
            case this.hap.Characteristic.RemoteKey.BACK: {
                this.debugLog('Set Remote Key Pressed: BACK');
                // this.pushBackChanges();
                break;
            }
            case this.hap.Characteristic.RemoteKey.EXIT: {
                this.debugLog('Set Remote Key Pressed: EXIT');
                break;
            }
            case this.hap.Characteristic.RemoteKey.PLAY_PAUSE: {
                this.debugLog('Set Remote Key Pressed: PLAY_PAUSE');
                break;
            }
            case this.hap.Characteristic.RemoteKey.INFORMATION: {
                this.debugLog('Set Remote Key Pressed: INFORMATION');
                // this.pushMenuChanges();
                break;
            }
        }
    }
    async ActiveIdentifierSet(value) {
        this.debugLog(`ActiveIdentifier: ${value}`);
        this.Television.ActiveIdentifier = value;
    }
    async ActiveSet(value) {
        this.debugLog(`Active (value): ${value}`);
        this.Television.Active = value;
        if (this.Television.Active === this.hap.Characteristic.Active.ACTIVE) {
            await this.pushTvOnChanges();
        }
        else {
            await this.pushTvOffChanges();
        }
    }
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType    commandType     Command           Parameter          Description
     * TV           "command"       "turnOff"         "default"          set to OFF state
     * TV           "command"       "turnOn"          "default"          set to ON state
     * TV           "command"       "volumeAdd"       "default"          volume up
     * TV           "command"       "volumeSub"       "default"          volume down
     * TV           "command"       "channelAdd"      "default"          next channel
     * TV           "command"       "channelSub"      "default"          previous channel
     */
    async pushTvOnChanges() {
        this.debugLog(`pushTvOnChanges Active: ${this.Television.Active}, disablePushOn: ${this.deviceDisablePushOn}`);
        if (this.Television.Active === this.hap.Characteristic.Active.ACTIVE && !this.deviceDisablePushOn) {
            const commandType = await this.commandType();
            const command = await this.commandOn();
            const bodyChange = {
                command,
                parameter: 'default',
                commandType,
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushTvOffChanges() {
        this.debugLog(`pushTvOffChanges Active: ${this.Television.Active}, disablePushOff: ${this.deviceDisablePushOff}`);
        if (this.Television.Active === this.hap.Characteristic.Active.INACTIVE && !this.deviceDisablePushOff) {
            const commandType = await this.commandType();
            const command = await this.commandOff();
            const bodyChange = {
                command,
                parameter: 'default',
                commandType,
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushOkChanges() {
        this.debugLog(`pushOkChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Ok',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushBackChanges() {
        this.debugLog(`pushBackChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Back',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushMenuChanges() {
        this.debugLog(`pushMenuChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Menu',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushUpChanges() {
        this.debugLog(`pushUpChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Up',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushDownChanges() {
        this.debugLog(`pushDownChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Down',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushRightChanges() {
        this.debugLog(`pushRightChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Right',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushLeftChanges() {
        this.debugLog(`pushLeftChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'Left',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushVolumeUpChanges() {
        this.debugLog(`pushVolumeUpChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'volumeAdd',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushVolumeDownChanges() {
        this.debugLog(`pushVolumeDownChanges disablePushDetail: ${this.deviceDisablePushDetail}`);
        if (!this.deviceDisablePushDetail) {
            const bodyChange = {
                command: 'volumeSub',
                parameter: 'default',
                commandType: 'command',
            };
            await this.pushTVChanges(bodyChange);
        }
    }
    async pushTVChanges(bodyChange) {
        this.debugLog('pushTVChanges');
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
        await this.updateCharacteristic(this.Television.Service, this.hap.Characteristic.Active, this.Television.Active, 'Active');
        // ActiveIdentifier
        await this.updateCharacteristic(this.Television.Service, this.hap.Characteristic.ActiveIdentifier, this.Television.ActiveIdentifier, 'ActiveIdentifier');
    }
    async apiError(e) {
        this.Television.Service.updateCharacteristic(this.hap.Characteristic.Active, e);
        this.Television.Service.updateCharacteristic(this.hap.Characteristic.ActiveIdentifier, e);
    }
}
//# sourceMappingURL=tv.js.map