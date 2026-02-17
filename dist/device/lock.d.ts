import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { device, lockProServiceData, lockProStatus, lockProWebhookContext, lockServiceData, lockStatus, lockWebhookContext, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
export declare class Lock extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private LockMechanism;
    private Battery;
    private ContactSensor?;
    private Switch?;
    deviceStatus: lockStatus | lockProStatus | any;
    webhookContext: lockWebhookContext | lockProWebhookContext | any;
    serviceData: lockServiceData | lockProServiceData | any;
    lockUpdateInProgress: boolean;
    doLockUpdate: Subject<void>;
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
     * deviceType  commandType   Command    command parameter   Description
     * Lock   -    "command"     "lock"     "default"  =        set to ???? state
     * Lock   -    "command"     "unlock"   "default"  =        set to ???? state - LockCurrentState
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(LatchUnlock?: boolean): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    LockTargetStateSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "On" characteristic
     */
    OnSet(value: CharacteristicValue): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=lock.d.ts.map