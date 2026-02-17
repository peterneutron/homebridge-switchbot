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
export declare class WaterHeater extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private Valve;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    ActiveSet(value: CharacteristicValue): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType      Command Type    Command           Parameter           Description
     * WaterHeater     "command"       "turnOff"         "default"         set to OFF state
     * WaterHeater     "command"       "turnOn"          "default"         set to ON state
     */
    pushWaterHeaterOnChanges(): Promise<void>;
    pushWaterHeaterOffChanges(): Promise<void>;
    pushChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError({ e }: {
        e: any;
    }): Promise<void>;
}
//# sourceMappingURL=waterheater.d.ts.map