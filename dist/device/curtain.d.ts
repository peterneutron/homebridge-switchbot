import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { curtain3ServiceData, curtain3WebhookContext, curtainServiceData, curtainStatus, curtainWebhookContext, device, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
export declare class Curtain extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private WindowCovering;
    private Battery;
    private LightSensor?;
    private OpenModeSwitch?;
    private CloseModeSwitch?;
    deviceStatus: curtainStatus;
    webhookContext: curtainWebhookContext | curtain3WebhookContext;
    serviceData: curtainServiceData | curtain3ServiceData;
    hasLoggedStandby: boolean;
    setNewTarget: boolean;
    setNewTargetTimer: NodeJS.Timeout;
    curtainMoving: boolean;
    curtainUpdateInProgress: boolean;
    doCurtainUpdate: Subject<void>;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: device & devicesConfig);
    history(): Promise<void>;
    setupHistoryService(): Promise<void>;
    updateHistory(): void;
    BLEparseStatus(): Promise<void>;
    openAPIparseStatus(): Promise<void>;
    parseStatusWebhook(): Promise<void>;
    /**
     * Asks the SwitchBot API for the latest device information
     */
    refreshStatus(): Promise<void>;
    BLERefreshStatus(): Promise<void>;
    openAPIRefreshStatus(): Promise<void>;
    registerWebhook(): Promise<void>;
    registerPlatformBLE(): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    /**
     * Handle requests to set the value of the "Target Position" characteristic
     */
    TargetPositionSet(value: CharacteristicValue): Promise<void>;
    startUpdatingCurtainIfNeeded(): Promise<void>;
    /**
     * Handle requests to set the value of the "Target Position" characteristic
     */
    HoldPositionSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Target Position" characteristic
     */
    OpenModeSwitchSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Target Position" characteristic
     */
    CloseModeSwitchSet(value: CharacteristicValue): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    setPerformance(): Promise<{
        setPositionMode: number;
        Mode: string;
    }>;
    getCurrentPostion(): Promise<void>;
    setMinMax(): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=curtain.d.ts.map