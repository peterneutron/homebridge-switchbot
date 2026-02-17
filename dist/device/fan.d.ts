import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { batteryCirculatorFanServiceData, batteryCirculatorFanStatus, batteryCirculatorFanWebhookContext, device, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
export declare class Fan extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private Fan;
    private Battery;
    private LightBulb;
    deviceStatus: batteryCirculatorFanStatus;
    webhookContext: batteryCirculatorFanWebhookContext;
    serviceData: batteryCirculatorFanServiceData;
    fanUpdateInProgress: boolean;
    doFanUpdate: Subject<void>;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: device & devicesConfig);
    BLEparseStatus(): Promise<void>;
    openAPIparseStatus(): Promise<void>;
    parseStatusWebhook(): Promise<void>;
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
     * commandType   command                 parameter                                 Description
     * "command"     "turnOff"               "default"                             =   set to OFF state
     * "command"     "turnOn"                "default"                             =   set to ON state
     * "command"     "setNightLightMode"     "off, 1, or 2"                        =   off, turn off nightlight, (1, bright) (2, dim)
     * "command"     "setWindMode"           "direct, natural, sleep, or baby"     =   Set fan mode
     * "command"     "setWindSpeed"          "{1-100} e.g. 10"                     =   Set fan speed 1~100
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    pushRotationSpeedChanges(): Promise<void>;
    pushSwingModeChanges(): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    ActiveSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    RotationSpeedSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    SwingModeSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    OnSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Brightness" characteristic
     */
    BrightnessSet(value: CharacteristicValue): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=fan.d.ts.map