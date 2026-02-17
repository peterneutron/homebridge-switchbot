import type { CharacteristicValue, Controller, ControllerConstructor, ControllerServiceMap, PlatformAccessory } from 'homebridge';
import type { colorBulbServiceData, colorBulbStatus, colorBulbWebhookContext, device, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class ColorBulb extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private LightBulb;
    deviceStatus: colorBulbStatus;
    webhookContext: colorBulbWebhookContext;
    serviceData: colorBulbServiceData;
    adaptiveLighting: boolean;
    adaptiveLightingShift: number;
    AdaptiveLightingController?: ControllerConstructor | Controller<ControllerServiceMap>;
    colorBulbUpdateInProgress: boolean;
    doColorBulbUpdate: Subject<void>;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: device & devicesConfig);
    /**
     * Parse the device status from the SwitchBotBLE API
     */
    BLEparseStatus(): Promise<void>;
    /**
     * Parse the device status from the SwitchBot OpenAPI
     */
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
     * deviceType        commandType       Command                  command parameter                      Description
     * Color Bulb   -    "command"         "turnOff"                "default"                        =     set to OFF state
     * Color Bulb   -    "command"         "turnOn"                 "default"                        =     set to ON state
     * Color Bulb   -    "command"         "toggle"                 "default"                        =     toggle state
     * Color Bulb   -    "command"         "setBrightness"          "{1-100}"                        =     set brightness
     * Color Bulb   -    "command"         "setColor"               "{0-255}:{0-255}:{0-255}"        =     set RGB color value
     * Color Bulb   -    "command"         "setColorTemperature"    "{2700-6500}"                    =     set color temperature
     *
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    BLEpushBrightnessChanges(): Promise<void>;
    BLEpushColorTemperatureChanges(): Promise<void>;
    BLEpushRGBChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    pushHueSaturationChanges(): Promise<void>;
    pushColorTemperatureChanges(): Promise<void>;
    pushBrightnessChanges(): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    OnSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Brightness" characteristic
     */
    BrightnessSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "ColorTemperature" characteristic
     */
    ColorTemperatureSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Hue" characteristic
     */
    HueSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Saturation" characteristic
     */
    SaturationSet(value: CharacteristicValue): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    getAdaptiveLightingSettings(accessory: PlatformAccessory, device: device & devicesConfig): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=colorbulb.d.ts.map