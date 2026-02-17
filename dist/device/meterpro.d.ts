import type { PlatformAccessory } from 'homebridge';
import type { device, meterProCO2ServiceData, meterProCO2Status, meterProCO2WebhookContext, meterProServiceData, meterProStatus, meterProWebhookContext, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class MeterPro extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private Battery;
    private HumiditySensor?;
    private TemperatureSensor?;
    private CarbonDioxideSensor?;
    deviceStatus: meterProStatus | meterProCO2Status;
    webhookContext: meterProWebhookContext | meterProCO2WebhookContext;
    serviceData: meterProServiceData | meterProCO2ServiceData;
    meterUpdateInProgress: boolean;
    doMeterUpdate: Subject<void>;
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
     * Updates the status for each of the HomeKit Characteristics
     */
    updateHomeKitCharacteristics(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=meterpro.d.ts.map