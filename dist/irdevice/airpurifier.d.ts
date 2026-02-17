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
export declare class AirPurifier extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private AirPurifier;
    private TemperatureSensor;
    APActive: CharacteristicValue;
    CurrentAPTemp: CharacteristicValue;
    CurrentAPMode: CharacteristicValue;
    CurrentAPFanSpeed: CharacteristicValue;
    Busy: any;
    Timeout: any;
    static IDLE: number;
    CurrentMode: number;
    static INACTIVE: number;
    LastTemperature: number;
    CurrentFanSpeed: number;
    static PURIFYING_AIR: number;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    ActiveSet(value: CharacteristicValue): Promise<void>;
    TargetAirPurifierStateSet(value: CharacteristicValue): Promise<void>;
    CurrentAirPurifierStateGet(): Promise<number>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType          commandType     Command          command parameter          Description
     * AirPurifier:        "command"       "turnOn"         "default"         =        every home appliance can be turned on by default
     * AirPurifier:        "command"       "turnOff"        "default"         =        every home appliance can be turned off by default
     * AirPurifier:        "command"       "swing"          "default"         =        swing
     * AirPurifier:        "command"       "timer"          "default"         =        timer
     * AirPurifier:        "command"       "lowSpeed"       "default"         =        fan speed to low
     * AirPurifier:        "command"       "middleSpeed"    "default"         =        fan speed to medium
     * AirPurifier:        "command"       "highSpeed"      "default"         =        fan speed to high
     */
    pushAirPurifierOnChanges(): Promise<void>;
    pushAirPurifierOffChanges(): Promise<void>;
    pushAirPurifierStatusChanges(): Promise<void>;
    pushAirPurifierDetailsChanges(): Promise<void>;
    pushChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=airpurifier.d.ts.map