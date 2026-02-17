import type { Server } from 'node:http';
import type { API, DynamicPlatformPlugin, Logging, PlatformAccessory } from 'homebridge';
import type { MqttClient } from 'mqtt';
import type { blindTilt, bodyChange, curtain, curtain3, device, deviceStatusRequest, irdevice } from 'node-switchbot';
import { SwitchBotBLE, SwitchBotOpenAPI } from 'node-switchbot';
import type { devicesConfig, irDevicesConfig, options, SwitchBotPlatformConfig } from './settings.js';
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export declare class SwitchBotPlatform implements DynamicPlatformPlugin {
    accessories: PlatformAccessory[];
    readonly api: API;
    readonly log: Logging;
    platformConfig: SwitchBotPlatformConfig;
    platformLogging: options['logging'];
    platformRefreshRate: options['refreshRate'];
    platformPushRate: options['pushRate'];
    platformUpdateRate: options['updateRate'];
    platformMaxRetries: options['maxRetries'];
    platformDelayBetweenRetries: options['delayBetweenRetries'];
    config: SwitchBotPlatformConfig;
    debugMode: boolean;
    version: string;
    mqttClient: MqttClient | null;
    webhookEventListener: Server | null;
    switchBotAPI: SwitchBotOpenAPI;
    switchBotBLE: SwitchBotBLE;
    readonly eve: any;
    readonly fakegatoAPI: any;
    readonly webhookEventHandler: {
        [x: string]: (context: any) => void;
    };
    readonly bleEventHandler: {
        [x: string]: (context: any) => void;
    };
    constructor(log: Logging, config: SwitchBotPlatformConfig, api: API);
    setupMqtt(): Promise<void>;
    setupwebhook(): Promise<void>;
    setupBlE(): Promise<void>;
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): Promise<void>;
    /**
     * Verify the config passed to the plugin is valid
     */
    verifyConfig(): void;
    discoverDevices(): Promise<void>;
    private handleManualConfig;
    private isSuccessfulResponse;
    private handleDevices;
    private handleIRDevices;
    private mergeByDeviceId;
    private handleErrorResponse;
    private createDevice;
    private createIRDevice;
    private createHumidifier;
    private createBot;
    private createRelaySwitch;
    private createMeter;
    private createMeterPlus;
    private createMeterPro;
    private createHub2;
    private createIOSensor;
    private createWaterDetector;
    private createMotion;
    private createPresence;
    private createContact;
    private createBlindTilt;
    private createCurtain;
    private createPlug;
    private createLock;
    private createColorBulb;
    private createCeilingLight;
    private createStripLight;
    private createFan;
    private createAirPurifierDevice;
    private createRobotVacuumCleaner;
    private createTV;
    private createIRFan;
    private createLight;
    private createAirConditioner;
    private createAirPurifier;
    private createWaterHeater;
    private createVacuumCleaner;
    private createCamera;
    private createOthers;
    registerCurtains(device: device & devicesConfig): Promise<boolean>;
    registerWindowCovering(device: (curtain | curtain3 | blindTilt) & devicesConfig): Promise<boolean>;
    connectionType(device: (device & devicesConfig) | (irdevice & irDevicesConfig)): Promise<any>;
    registerDevice(device: device & devicesConfig): Promise<boolean>;
    handleDeviceRegistration(device: device & devicesConfig): Promise<boolean>;
    externalOrPlatform(device: (device & devicesConfig) | (irdevice & irDevicesConfig), accessory: PlatformAccessory): Promise<void>;
    unregisterPlatformAccessories(existingAccessory: PlatformAccessory): void;
    /**
     * Handles the status codes returned by the device and logs appropriate messages.
     *
     * @param statusCode - The status code returned by the device.
     * @returns A promise that resolves when the logging is complete.
     */
    statusCode(statusCode: number): Promise<void>;
    retryRequest(device: (device & devicesConfig) | (irdevice & irDevicesConfig), deviceMaxRetries: number, deviceDelayBetweenRetries: number): Promise<{
        response: any;
        statusCode: deviceStatusRequest['statusCode'];
    }>;
    retryCommand(device: (device & devicesConfig) | (irdevice & irDevicesConfig), bodyChange: bodyChange, deviceMaxRetries?: number, deviceDelayBetweenRetries?: number): Promise<{
        response: any;
        statusCode: number;
    }>;
    connectBLE(accessory: PlatformAccessory, device: device & devicesConfig): Promise<any>;
    getPlatformConfigSettings(): Promise<void>;
    getPlatformRateSettings(): Promise<void>;
    getPlatformLogSettings(): Promise<void>;
    /**
     * Asynchronously retrieves the version of the plugin from the package.json file.
     *
     * This method reads the package.json file located in the parent directory,
     * parses its content to extract the version, and logs the version using the debug logger.
     * The extracted version is then assigned to the `version` property of the class.
     *
     * @returns {Promise<void>} A promise that resolves when the version has been retrieved and logged.
     */
    getVersion(): Promise<void>;
    /**
     * Validate and clean a string value for a Name Characteristic.
     * @param displayName - The display name of the accessory.
     * @param name - The name of the characteristic.
     * @param value - The value to be validated and cleaned.
     * @returns The cleaned string value.
     */
    validateAndCleanDisplayName(displayName: string, name: string, value: string): Promise<string>;
    /**
     * If device level logging is turned on, log to log.warn
     * Otherwise send debug logs to log.debug
     */
    infoLog(...log: any[]): Promise<void>;
    successLog(...log: any[]): Promise<void>;
    debugSuccessLog(...log: any[]): Promise<void>;
    warnLog(...log: any[]): Promise<void>;
    debugWarnLog(...log: any[]): Promise<void>;
    errorLog(...log: any[]): Promise<void>;
    debugErrorLog(...log: any[]): Promise<void>;
    debugLog(...log: any[]): Promise<void>;
    loggingIsDebug(): Promise<boolean>;
    enablingPlatformLogging(): Promise<boolean>;
}
//# sourceMappingURL=platform.d.ts.map