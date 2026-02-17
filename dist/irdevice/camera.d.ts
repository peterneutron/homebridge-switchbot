import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { irdevice } from 'node-switchbot';
import type { SwitchBotPlatform } from '../platform.js';
import type { irDevicesConfig } from '../settings.js';
import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Camera extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private Switch;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    OnSet(value: CharacteristicValue): Promise<void>;
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
    pushOnChanges(): Promise<void>;
    pushOffChanges(): Promise<void>;
    pushChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=camera.d.ts.map