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
export declare class AirConditioner extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private HeaterCooler;
    meter?: PlatformAccessory;
    private HumiditySensor?;
    state: string;
    Busy: any;
    Timeout: any;
    CurrentMode: number;
    ValidValues: number[];
    CurrentFanSpeed: number;
    hide_automode?: boolean;
    set_max_heat?: number;
    set_min_heat?: number;
    set_max_cool?: number;
    set_min_cool?: number;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType             commandType     Command            command parameter                    Description
     * AirConditioner:        "command"       "swing"            "default"                   =        swing
     * AirConditioner:        "command"       "timer"            "default"                   =        timer
     * AirConditioner:        "command"       "lowSpeed"         "default"                   =        fan speed to low
     * AirConditioner:        "command"       "middleSpeed"      "default"                   =        fan speed to medium
     * AirConditioner:        "command"       "highSpeed"        "default"                   =        fan speed to high
     */
    pushAirConditionerOnChanges(): Promise<void>;
    pushAirConditionerOffChanges(): Promise<void>;
    pushAirConditionerStatusChanges(): Promise<void>;
    pushAirConditionerDetailsChanges(): Promise<void>;
    private UpdateCurrentHeaterCoolerState;
    pushChanges(bodyChange: any): Promise<void>;
    CurrentTemperatureGet(): Promise<CharacteristicValue>;
    CurrentRelativeHumidityGet(): Promise<CharacteristicValue>;
    RotationSpeedGet(): Promise<number>;
    RotationSpeedSet(value: CharacteristicValue): Promise<void>;
    ActiveSet(value: CharacteristicValue): Promise<void>;
    TargetHeaterCoolerStateGet(): Promise<CharacteristicValue>;
    TargetHeaterCoolerStateSet(value: CharacteristicValue): Promise<void>;
    TargetHeaterCoolerStateAUTO(): Promise<void>;
    TargetHeaterCoolerStateCOOL(): Promise<void>;
    TargetHeaterCoolerStateHEAT(): Promise<void>;
    CurrentHeaterCoolerStateGet(): Promise<CharacteristicValue>;
    private getTargetHeaterCoolerStateName;
    ThresholdTemperatureGet(): Promise<CharacteristicValue>;
    ThresholdTemperatureSet(value: CharacteristicValue): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
    getAirConditionerConfigSettings(accessory: PlatformAccessory, device: irdevice & irDevicesConfig): Promise<void>;
}
//# sourceMappingURL=airconditioner.d.ts.map