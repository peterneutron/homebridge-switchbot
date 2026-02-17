import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { device, plugMiniJPServiceData, plugMiniJPWebhookContext, plugMiniStatus, plugMiniUSServiceData, plugMiniUSWebhookContext, plugStatus, plugWebhookContext, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
export declare class Plug extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private Outlet;
    deviceStatus: plugStatus | plugMiniStatus;
    webhookContext: plugWebhookContext | plugMiniUSWebhookContext | plugMiniJPWebhookContext;
    serviceData: plugMiniUSServiceData | plugMiniJPServiceData;
    plugUpdateInProgress: boolean;
    doPlugUpdate: Subject<void>;
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
     * deviceType              commandType   Command     command parameter     Description
     * Plug               -    "command"     "turnOff"   "default"    =        set to OFF state
     * Plug               -    "command"     "turnOn"    "default"    =        set to ON state
     * Plug Mini (US/JP)  -    "command"     "turnOn"    "default"    =        set to ON state
     * Plug Mini (US/JP)  -    "command"     "turnOff"   "default"    =        set to OFF state
     * Plug Mini (US/JP)  -    "command"     "toggle"    "default"    =        toggle state
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
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
//# sourceMappingURL=plug.d.ts.map