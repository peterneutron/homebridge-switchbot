import type { API, CharacteristicValue, HAP, Logging, PlatformAccessory, Service } from 'homebridge';
import type { bodyChange, irdevice } from 'node-switchbot';
import type { SwitchBotPlatform } from '../platform.js';
import type { irDevicesConfig, SwitchBotPlatformConfig } from '../settings.js';
export declare abstract class irdeviceBase {
    protected readonly platform: SwitchBotPlatform;
    protected accessory: PlatformAccessory;
    protected device: irdevice & irDevicesConfig;
    readonly api: API;
    readonly log: Logging;
    readonly config: SwitchBotPlatformConfig;
    protected readonly hap: HAP;
    protected deviceLogging: string;
    protected deviceRefreshRate: number;
    protected deviceUpdateRate: number;
    protected devicePushRate: number;
    protected deviceMaxRetries: number;
    protected deviceDelayBetweenRetries: number;
    protected deviceDisablePushOn: boolean;
    protected deviceDisablePushOff: boolean;
    protected deviceDisablePushDetail?: boolean;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    getDeviceLogSettings(accessory: PlatformAccessory, device: irdevice & irDevicesConfig): Promise<void>;
    getDeviceRateSettings(device: irdevice & irDevicesConfig): Promise<void>;
    getDeviceConfigSettings(device: irdevice & irDevicesConfig): Promise<void>;
    getDeviceContext(accessory: PlatformAccessory, device: irdevice & irDevicesConfig): Promise<void>;
    pushChangeRequest(bodyChange: bodyChange): Promise<{
        body: any;
        statusCode: number;
    }>;
    successfulStatusCodes(deviceStatus: any): Promise<boolean>;
    /**
     * Update the characteristic value and log the change.
     *
     * @param Service Service
     * @param Characteristic Characteristic
     * @param CharacteristicValue CharacteristicValue | undefined
     * @param CharacteristicName string
     * @return: void
     *
     */
    updateCharacteristic(Service: Service, Characteristic: any, CharacteristicValue: CharacteristicValue | undefined, CharacteristicName: string): Promise<void>;
    pushStatusCodes(deviceStatus: any): Promise<void>;
    successfulPushChange(deviceStatus: any, bodyChange: any): Promise<void>;
    pushChangeError(e: Error): Promise<void>;
    commandType(): Promise<string>;
    commandOn(): Promise<string>;
    commandOff(): Promise<string>;
    statusCode(statusCode: number): Promise<void>;
    /**
     * Logging for Device
     */
    infoLog(...log: any[]): Promise<void>;
    successLog(...log: any[]): Promise<void>;
    debugSuccessLog(...log: any[]): Promise<void>;
    warnLog(...log: any[]): Promise<void>;
    debugWarnLog(...log: any[]): Promise<void>;
    errorLog(...log: any[]): Promise<void>;
    debugErrorLog(...log: any[]): Promise<void>;
    debugLog(...log: any[]): Promise<void>;
    loggingIsDebug(): Promise<boolean>;
    enablingDeviceLogging(): Promise<boolean>;
}
//# sourceMappingURL=irdevice.d.ts.map