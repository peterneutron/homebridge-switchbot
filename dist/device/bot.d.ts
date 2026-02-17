import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { botServiceData, botStatus, botWebhookContext, device, SwitchBotBLE } from 'node-switchbot';
import { WoHand } from 'node-switchbot';
import { Subject } from 'rxjs';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig } from '../settings.js';
import { deviceBase } from './device.js';
type BotBleAction = 0x00 | 0x01 | 0x02;
export declare function executeBotBleAction(device: WoHand, action: BotBleAction, password?: string): Promise<void>;
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Bot extends deviceBase {
    readonly platform: SwitchBotPlatform;
    private Battery;
    private Switch?;
    private GarageDoor?;
    private Door?;
    private Window?;
    private WindowCovering?;
    private LockMechanism?;
    private Faucet?;
    private Fan?;
    private StatefulProgrammableSwitch?;
    private Outlet?;
    On: boolean;
    deviceStatus: botStatus;
    webhookContext: botWebhookContext;
    serviceData: botServiceData;
    botMode: string;
    allowPush?: boolean;
    doublePress: number;
    botDeviceType: string;
    pushRatePress: number;
    multiPressCount: number;
    botUpdateInProgress: boolean;
    doBotUpdate: Subject<void>;
    /**
     * Constructs a new instance of the Bot device.
     *
     * @param {SwitchBotPlatform} platform - The platform instance.
     * @param {PlatformAccessory} accessory - The platform accessory.
     * @param {device & devicesConfig} device - The device configuration.
     *
     * Initializes the Bot device, sets up the battery service, maps the device type to the appropriate HomeKit service,
     * removes unnecessary services, retrieves initial values, registers event handlers, and starts update intervals.
     *
     * @constructor
     */
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
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType  commandType  Command    command parameter  Description
     * Bot         "command"    "turnOff"  "default"      =   set to OFF state
     * Bot         "command"    "turnOn"   "default"      =   set to ON state
     * Bot         "command"    "press"    "default"      =   trigger press
     */
    pushChanges(): Promise<void>;
    private discoverBotDeviceWithFallback;
    BLEpushChanges(): Promise<void>;
    openAPIpushChanges(): Promise<void>;
    /**
     * Handle requests to set the "On" characteristic
     */
    OnSet(value: CharacteristicValue): Promise<void>;
    /**
     * Updates the status for each of the HomeKit Characteristics
     */
    updateHomeKitCharacteristics(): Promise<void>;
    removeService(accessory: PlatformAccessory, serviceType: string, serviceName: string): Promise<void>;
    removeOutletService(accessory: PlatformAccessory): Promise<void>;
    removeGarageDoorService(accessory: PlatformAccessory): Promise<void>;
    removeDoorService(accessory: PlatformAccessory): Promise<void>;
    removeLockService(accessory: PlatformAccessory): Promise<void>;
    removeFaucetService(accessory: PlatformAccessory): Promise<void>;
    removeFanService(accessory: PlatformAccessory): Promise<void>;
    removeWindowService(accessory: PlatformAccessory): Promise<void>;
    removeWindowCoveringService(accessory: PlatformAccessory): Promise<void>;
    removeStatefulProgrammableSwitchService(accessory: PlatformAccessory): Promise<void>;
    removeSwitchService(accessory: PlatformAccessory): Promise<void>;
    getBotConfigSettings(device: device & devicesConfig): Promise<void>;
    BLEPushConnection(): Promise<void>;
    BLERefreshConnection(switchbot: SwitchBotBLE): Promise<void>;
    offlineOff(): Promise<void>;
    apiError(e: any): Promise<void>;
}
export {};
//# sourceMappingURL=bot.d.ts.map