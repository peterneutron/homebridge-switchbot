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
export declare class VacuumCleaner extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private Switch;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    OnSet(value: CharacteristicValue): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType        CommandType     Command        Parameter       Description
     * Vacuum Cleaner    "command"       "turnOff"      "default"       set to OFF state
     * Vacuum Cleaner    "command"       "turnOn"       "default"       set to ON state
     */
    pushOnChanges(): Promise<void>;
    pushOffChanges(): Promise<void>;
    pushChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=vacuumcleaner.d.ts.map