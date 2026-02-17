import type { PlatformAccessory } from 'homebridge';
import type { device, hub2ServiceData, hub2Status, hub2WebhookContext, hub3ServiceData, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
/**
 * Hub sensor data structure
 * Represents the sensor readings that can be at root level (Hub 2) or nested (Hub 3)
 */
interface HubSensorData {
    temperature: number;
    humidity: number;
    lightLevel: number;
}
/**
 * Extended Hub status type that supports both Hub 2 and Hub 3 API response structures
 * Hub 2 returns sensor data at root level
 * Hub 3 returns sensor data in a nested sensorData object
 */
type HubStatus = hub2Status & {
    sensorData?: HubSensorData;
};
export declare class Hub extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private LightSensor?;
    private HumiditySensor?;
    private TemperatureSensor?;
    deviceStatus: HubStatus;
    webhookContext: hub2WebhookContext;
    serviceData: hub2ServiceData | hub3ServiceData;
    hubUpdateInProgress: boolean;
    doHubUpdate: Subject<void>;
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
     * Handle requests to set the value of the "Target Position" characteristic
     */
    updateHomeKitCharacteristics(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
export {};
//# sourceMappingURL=hub.d.ts.map