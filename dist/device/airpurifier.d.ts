import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { airPurifierServiceData, airPurifierStatus, device } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
export declare class AirPurifier extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private AirPurifier;
    private AirQualitySensor?;
    deviceStatus: airPurifierStatus;
    serviceData: airPurifierServiceData;
    airPurifierUpdateInProgress: boolean;
    doAirPurifierUpdate: Subject<void>;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: device & devicesConfig);
    /**
     * Validates that essential BLE service data properties are present
     * @param data - The service data to validate
     * @returns true if all essential properties are defined, false otherwise
     */
    private hasEssentialBLEData;
    BLEparseStatus(): Promise<void>;
    openAPIparseStatus(): Promise<void>;
    /**
     * Asks the SwitchBot API for the latest device information
     */
    refreshStatus(): Promise<void>;
    BLERefreshStatus(): Promise<void>;
    registerPlatformBLE(): Promise<void>;
    openAPIRefreshStatus(): Promise<void>;
    registerWebhook(): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * commandType   command         parameter         Description
     * "command"     "turnOff"       "default"     =   set to OFF state
     * "command"     "turnOn"        "default"     =   set to ON state
     * "command"     "setMode"       "{0-3}"       =   0 for auto, 1 for low, 2 for medium, 3 for high
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    ActiveSet(value: CharacteristicValue): Promise<void>;
    RotationSpeedSet(value: CharacteristicValue): Promise<void>;
    TargetAirPurifierStateSet(value: CharacteristicValue): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: any): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=airpurifier.d.ts.map