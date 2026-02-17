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
export declare class IRFan extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private Fan;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    SwingModeSet(value: CharacteristicValue): Promise<void>;
    RotationSpeedSet(value: CharacteristicValue): Promise<void>;
    ActiveSet(value: CharacteristicValue): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType  commandType     Command           command parameter           Description
     * Fan -        "command"       "swing"          "default"          =        swing
     * Fan -        "command"       "timer"          "default"          =        timer
     * Fan -        "command"       "lowSpeed"       "default"          =        fan speed to low
     * Fan -        "command"       "middleSpeed"    "default"          =        fan speed to medium
     * Fan -        "command"       "highSpeed"      "default"          =        fan speed to high
     */
    pushFanOnChanges(): Promise<void>;
    pushFanOffChanges(): Promise<void>;
    pushFanSpeedUpChanges(): Promise<void>;
    pushFanSpeedDownChanges(): Promise<void>;
    pushFanSwingChanges(): Promise<void>;
    pushChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=fan.d.ts.map