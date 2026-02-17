import type { PlatformAccessory } from 'homebridge';
import type { contactSensorServiceData, contactSensorStatus, contactSensorWebhookContext, device, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Contact extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private ContactSensor;
    private Battery;
    private MotionSensor?;
    private LightSensor?;
    deviceStatus: contactSensorStatus;
    webhookContext: contactSensorWebhookContext;
    serviceData: contactSensorServiceData;
    contactUpdateInProgress: boolean;
    doContactUpdate: Subject<void>;
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
    private getContactSensorState;
}
//# sourceMappingURL=contact.d.ts.map