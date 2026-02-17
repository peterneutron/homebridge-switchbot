import type { API, CharacteristicValue, HAP, Logging, PlatformAccessory, Service } from 'homebridge';
import type { MqttClient } from 'mqtt';
import type { ad, bodyChange, device, deviceStatus, deviceStatusRequest, pushResponse, SwitchBotBLE } from 'node-switchbot';
import { SwitchBotBLEModel, SwitchBotModel } from 'node-switchbot';
import type { SwitchBotPlatform } from '../platform.js';
import type { devicesConfig, SwitchBotPlatformConfig } from '../settings.js';
export declare abstract class deviceBase {
    protected readonly platform: SwitchBotPlatform;
    protected accessory: PlatformAccessory;
    protected device: device & devicesConfig;
    readonly api: API;
    readonly log: Logging;
    readonly config: SwitchBotPlatformConfig;
    protected readonly hap: HAP;
    protected deviceLogging: string;
    protected deviceRefreshRate: number;
    protected deviceUpdateRate: number;
    protected devicePushRate: number;
    protected deviceMaxRetries: number;
    protected deviceDelayBetweenRetries: number;
    protected readonly BLE: boolean;
    protected readonly OpenAPI: boolean;
    protected deviceModel: SwitchBotModel;
    protected deviceBLEModel: SwitchBotBLEModel;
    protected deviceMqttURL: string;
    protected deviceMqttOptions: any;
    protected deviceMqttPubOptions: any;
    protected scanDuration: number;
    protected historyService?: any;
    protected mqttClient: MqttClient | null;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: device & devicesConfig);
    getDeviceLogSettings(device: device & devicesConfig): Promise<void>;
    getDeviceRateSettings(device: device & devicesConfig): Promise<void>;
    retryBLE({ max, fn }: {
        max: number;
        fn: {
            (): any;
            (): Promise<any>;
        };
    }): Promise<null>;
    maxRetryBLE(): number;
    getDeviceConfigSettings(device: device & devicesConfig): Promise<void>;
    /**
     * Get the current ambient light level based on the light level, set_minLux, set_maxLux, and spaceBetweenLevels.
     * @param lightLevel number
     * @param set_minLux number
     * @param set_maxLux number
     * @param spaceBetweenLevels number
     * @returns CurrentAmbientLightLevel
     */
    getLightLevel(lightLevel: number, set_minLux: number, set_maxLux: number, spaceBetweenLevels: number): number;
    mqttPublish(message: string, topic?: string): Promise<void>;
    getMqttSettings(device: device & devicesConfig): Promise<void>;
    setupHistoryService(accessory: PlatformAccessory, device: device & devicesConfig): Promise<void>;
    switchbotBLE(): Promise<any>;
    monitorAdvertisementPackets(switchbot: SwitchBotBLE): Promise<ad['serviceData']>;
    getCustomBLEAddress(switchbot: SwitchBotBLE): Promise<void>;
    pushChangeRequest(bodyChange: bodyChange): Promise<{
        body: pushResponse['body'];
        statusCode: pushResponse['statusCode'];
    }>;
    deviceRefreshStatus(): Promise<{
        body: deviceStatus;
        statusCode: deviceStatusRequest['statusCode'];
    }>;
    successfulStatusCodes(deviceStatus: deviceStatusRequest): Promise<boolean>;
    /**
     * Update the characteristic value and log the change.
     *
     * @param Service Service
     * @param Characteristic Characteristic
     * @param CharacteristicValue CharacteristicValue | undefined
     * @param CharacteristicName string
     * @param history object
     * @return: void
     *
     */
    updateCharacteristic(Service: Service, Characteristic: any, CharacteristicValue: CharacteristicValue | undefined, CharacteristicName: string, history?: object): Promise<void>;
    mqtt(CharacteristicName: string, CharacteristicValue: CharacteristicValue): Promise<void>;
    getDeviceContext(accessory: PlatformAccessory, device: device & devicesConfig): Promise<void>;
    statusCode(statusCode: number): Promise<void>;
    /**
     * Logging for Device
     */
    infoLog(...log: any[]): void;
    successLog(...log: any[]): void;
    debugSuccessLog(...log: any[]): void;
    warnLog(...log: any[]): void;
    debugWarnLog(...log: any[]): void;
    errorLog(...log: any[]): void;
    debugErrorLog(...log: any[]): void;
    debugLog(...log: any[]): void;
    loggingIsDebug(): boolean;
    enablingDeviceLogging(): boolean;
}
//# sourceMappingURL=device.d.ts.map