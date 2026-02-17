import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { device, floorCleaningRobotS10Status, floorCleaningRobotS10WebhookContext, robotVacuumCleanerS1PlusStatus, robotVacuumCleanerS1PlusWebhookContext, robotVacuumCleanerS1Status, robotVacuumCleanerS1WebhookContext, robotVacuumCleanerServiceData, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
export declare class RobotVacuumCleaner extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private LightBulb;
    private Battery;
    deviceStatus: robotVacuumCleanerS1Status | robotVacuumCleanerS1PlusStatus | floorCleaningRobotS10Status;
    webhookContext: robotVacuumCleanerS1WebhookContext | robotVacuumCleanerS1PlusWebhookContext | floorCleaningRobotS10WebhookContext;
    serviceData: robotVacuumCleanerServiceData;
    robotVacuumCleanerUpdateInProgress: boolean;
    doRobotVacuumCleanerUpdate: Subject<void>;
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
     * deviceType                commandType   Command      parameter          Description
     * Robot Vacuum Cleaner S1   "command"     "start"      "default"    =     start vacuuming
     * Robot Vacuum Cleaner S1   "command"     "stop"       "default"    =     stop vacuuming
     * Robot Vacuum Cleaner S1   "command"     "dock"       "default"   =      return to charging dock
     * Robot Vacuum Cleaner S1   "command"     "PowLevel"   "{0-3}"     =      set suction power level: 0 (Quiet), 1 (Standard), 2 (Strong), 3 (MAX)
     */
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    openAPIpushBrightnessChanges(): Promise<void>;
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
//# sourceMappingURL=robotvacuumcleaner.d.ts.map