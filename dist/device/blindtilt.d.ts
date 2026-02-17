import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { blindTiltServiceData, blindTiltStatus, blindTiltWebhookContext, device, SwitchBotBLE } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { BlindTiltMappingMode } from '../utils.js';
import { deviceBase } from './device.js';
export declare class BlindTilt extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private WindowCovering;
    private Battery;
    private LightSensor?;
    private OpenModeSwitch?;
    private CloseModeSwitch?;
    deviceStatus: blindTiltStatus;
    mappingMode: BlindTiltMappingMode;
    webhookContext: blindTiltWebhookContext;
    serviceData: blindTiltServiceData;
    setNewTarget: boolean;
    setNewTargetTimer: NodeJS.Timeout;
    blindTiltMoving: boolean;
    blindTiltUpdateInProgress: boolean;
    doBlindTiltUpdate: Subject<void>;
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
    pushChanges(): Promise<void>;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    /**
     * Handle requests to set the value of the "Target Horizontal Tilt" characteristic
     */
    TargetHorizontalTiltAngleSet(value: CharacteristicValue): Promise<void>;
    /**
     * Handle requests to set the value of the "Target Position" characteristic
     */
    TargetPositionSet(value: CharacteristicValue): Promise<void>;
    startUpdatingBlindTiltIfNeeded(): Promise<void>;
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
    setMinMax(): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
    getCurrentPosttionDirection(direction: blindTiltStatus['direction'] | blindTiltWebhookContext['direction'], slidePosition: blindTiltStatus['slidePosition'] | blindTiltWebhookContext['slidePosition']): Promise<void>;
    /**
     * Maps device values to homekit values
     *
     * @param devicePosition the position as reported by the devide
     * @param deviceDirection the direction as reported by the device
     * @returns [homekit position, homekit tiltAngle]
     */
    mapDeviceValuesToHomekitValues(devicePosition: number, deviceDirection: string): [CharacteristicValue, CharacteristicValue?];
    /**
     * Maps homekit values to device values
     *
     * @param homekitPosition the position as reported by homekit
     * @param homekitTiltAngle the tilt angle as reported by homekit
     * @returns [device position, device direction]
     */
    mapHomekitValuesToDeviceValues(homekitPosition: number, homekitTiltAngle: number): [string, number];
}
//# sourceMappingURL=blindtilt.d.ts.map