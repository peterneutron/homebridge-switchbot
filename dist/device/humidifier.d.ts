import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { device, humidifier2ServiceData, humidifier2Status, humidifier2WebhookContext, humidifierServiceData, humidifierStatus, humidifierWebhookContext, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Humidifier extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private HumidifierDehumidifier;
    private TemperatureSensor?;
    deviceStatus: humidifierStatus | humidifier2Status;
    webhookContext: humidifierWebhookContext | humidifier2WebhookContext;
    serviceData: humidifierServiceData | humidifier2ServiceData;
    humidifierUpdateInProgress: boolean;
    doHumidifierUpdate: Subject<void>;
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
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     */
    pushAutoChanges(): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     */
    pushActiveChanges(): Promise<void>;
    /**
     * Handle requests to set the "Active" characteristic
     */
    ActiveSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the "Target Humidifier Dehumidifier State" characteristic
     */
    TargetHumidifierDehumidifierStateSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the "Relative Humidity Humidifier Threshold" characteristic
     */
    RelativeHumidityHumidifierThresholdSet(value: CharacteristicValue): Promise<void>;
    /**
     * Updates the status for each of the HomeKit Characteristics
     */
    updateHomeKitCharacteristics(): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=humidifier.d.ts.map