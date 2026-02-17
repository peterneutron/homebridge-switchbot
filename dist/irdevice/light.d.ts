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
export declare class Light extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private LightBulb?;
    private ProgrammableSwitchOn?;
    private ProgrammableSwitchOff?;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    OnSet(value: CharacteristicValue): Promise<void>;
    ProgrammableSwitchOutputStateSetOn(value: CharacteristicValue): Promise<void>;
    ProgrammableSwitchOutputStateSetOff(value: CharacteristicValue): Promise<void>;
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
    pushLightOnChanges(On: boolean): Promise<void>;
    pushLightOffChanges(On: boolean): Promise<void>;
    pushChanges(bodyChange: any, On: boolean): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=light.d.ts.map