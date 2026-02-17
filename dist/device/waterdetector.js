/*
* For Testing Locally:
* import { SwitchBotBLEModel, SwitchBotBLEModelName } from '/Users/Shared/GitHub/OpenWonderLabs/node-switchbot/dist/index.js';
*/
import { SwitchBotBLEModel, SwitchBotBLEModelName } from 'node-switchbot';
import { interval, skipWhile, Subject } from 'rxjs';
import { formatDeviceIdAsMac } from '../utils.js';
import { deviceBase } from './device.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class WaterDetector extends deviceBase {
    platform;
    // Services
    Battery;
    LeakSensor;
    // OpenAPI
    deviceStatus;
    // Webhook
    webhookContext;
    // BLE
    serviceData;
    // Updates
    WaterDetectorUpdateInProgress;
    doWaterDetectorUpdate;
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        // Set category
        accessory.category = 10 /* this.hap.Categories.SENSOR */;
        // this is subject we use to track when we need to POST changes to the SwitchBot API
        this.doWaterDetectorUpdate = new Subject();
        this.WaterDetectorUpdateInProgress = false;
        // Initialize Battery Service
        accessory.context.Battery = accessory.context.Battery ?? {};
        this.Battery = {
            Name: `${accessory.displayName} Battery`,
            Service: accessory.getService(this.hap.Service.Battery) ?? accessory.addService(this.hap.Service.Battery),
            BatteryLevel: accessory.context.BatteryLevel ?? 100,
            StatusLowBattery: accessory.context.StatusLowBattery ?? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
            ChargingState: accessory.context.ChargingState ?? this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
        };
        accessory.context.Battery = this.Battery;
        // Initialize Battery Characteristic
        this.Battery.Service.setCharacteristic(this.hap.Characteristic.Name, this.Battery.Name).setCharacteristic(this.hap.Characteristic.ChargingState, this.hap.Characteristic.ChargingState.NOT_CHARGEABLE).getCharacteristic(this.hap.Characteristic.BatteryLevel).onGet(() => {
            return this.Battery.StatusLowBattery;
        });
        this.Battery.Service.getCharacteristic(this.hap.Characteristic.StatusLowBattery).onGet(() => {
            return this.Battery.StatusLowBattery;
        });
        // Initialize Leak Sensor Service
        if (device.hide_leak) {
            if (this.LeakSensor) {
                this.debugLog('Removing Leak Sensor Service');
                this.LeakSensor.Service = this.accessory.getService(this.hap.Service.LeakSensor);
                accessory.removeService(this.LeakSensor.Service);
            }
            else {
                this.debugLog('Leak Sensor Service Not Found');
            }
        }
        else {
            accessory.context.LeakSensor = accessory.context.LeakSensor ?? {};
            this.LeakSensor = {
                Name: `${accessory.displayName} Leak Sensor`,
                Service: accessory.getService(this.hap.Service.LeakSensor) ?? this.accessory.addService(this.hap.Service.LeakSensor),
                StatusActive: accessory.context.StatusActive ?? false,
                LeakDetected: accessory.context.LeakDetected ?? this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED,
            };
            accessory.context.LeakSensor = this.LeakSensor;
            // Initialize LeakSensor Characteristic
            this.LeakSensor.Service.setCharacteristic(this.hap.Characteristic.Name, this.LeakSensor.Name).setCharacteristic(this.hap.Characteristic.StatusActive, true);
        }
        // Retrieve initial values and updateHomekit
        try {
            this.debugLog('Retrieve initial values and update Homekit');
            this.refreshStatus();
        }
        catch (e) {
            this.errorLog(`failed to retrieve initial values and update Homekit, Error: ${e.message ?? e}`);
        }
        // regisiter webhook event handler if enabled
        try {
            this.debugLog('Registering Webhook Event Handler');
            this.registerWebhook();
        }
        catch (e) {
            this.errorLog(`failed to registerWebhook, Error: ${e.message ?? e}`);
        }
        // regisiter platform BLE event handler if enabled
        try {
            this.debugLog('Registering Platform BLE Event Handler');
            this.registerPlatformBLE();
        }
        catch (e) {
            this.errorLog(`failed to registerPlatformBLE, Error: ${e.message ?? e}`);
        }
        // Start an update interval
        interval(this.deviceRefreshRate * 1000)
            .pipe(skipWhile(() => this.WaterDetectorUpdateInProgress))
            .subscribe(async () => {
            this.debugLog(`update interval: ${this.deviceRefreshRate * 1000} seconds`);
            await this.refreshStatus();
        });
    }
    async BLEparseStatus() {
        this.debugLog('BLEparseStatus');
        this.debugLog(`(leak, tampered, battery) = BLE: (${this.serviceData.leak}, ${this.serviceData.tampered}, ${this.serviceData.battery}), current:(${this.LeakSensor?.LeakDetected}, ${this.LeakSensor?.StatusActive}, ${this.Battery.BatteryLevel})`);
        // LeakSensor
        if (!this.device.hide_leak && this.LeakSensor?.Service) {
            // StatusActive
            this.LeakSensor.StatusActive = this.serviceData.tampered;
            this.debugLog(`StatusActive: ${this.LeakSensor.StatusActive}`);
            // LeakDetected
            this.LeakSensor.LeakDetected = this.device.dry
                ? !this.serviceData.leak ? this.hap.Characteristic.LeakDetected.LEAK_DETECTED : this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED
                : this.serviceData.leak ? this.hap.Characteristic.LeakDetected.LEAK_DETECTED : this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED;
            this.LeakSensor.LeakDetected === this.hap.Characteristic.LeakDetected.LEAK_DETECTED ? this.warnLog(`LeakDetected: ${this.LeakSensor.LeakDetected}, dry: ${this.device.dry}, BLE`) : this.debugLog(`LeakDetected: ${this.LeakSensor.LeakDetected}, dry: ${this.device.dry}, BLE`);
        }
        // Battery Info
        if ('battery' in this.serviceData) {
            // BatteryLevel
            this.Battery.BatteryLevel = this.serviceData.battery;
            this.debugLog(`BatteryLevel: ${this.Battery.BatteryLevel}`);
            // StatusLowBattery
            this.Battery.StatusLowBattery = this.Battery.BatteryLevel < 10
                ? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                : this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
            this.debugLog(`StatusLowBattery: ${this.Battery.StatusLowBattery}`);
        }
    }
    async openAPIparseStatus() {
        this.debugLog('openAPIparseStatus');
        this.debugLog(`(status, battery) = OpenAPI: (${this.deviceStatus.status}, ${this.deviceStatus.battery}), current:(${this.LeakSensor?.LeakDetected}, ${this.Battery.BatteryLevel})`);
        // LeakSensor
        if (!this.device.hide_leak && this.LeakSensor?.Service) {
            // StatusActive
            this.LeakSensor.StatusActive = this.deviceStatus.battery !== 0;
            this.debugLog(`StatusActive: ${this.LeakSensor.StatusActive}`);
            // LeakDetected
            this.LeakSensor.LeakDetected = this.device.dry
                ? this.deviceStatus.status === 0 ? this.hap.Characteristic.LeakDetected.LEAK_DETECTED : this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED
                : this.deviceStatus.status === 1 ? this.hap.Characteristic.LeakDetected.LEAK_DETECTED : this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED;
            this.LeakSensor.LeakDetected === this.hap.Characteristic.LeakDetected.LEAK_DETECTED ? this.warnLog(`LeakDetected: ${this.LeakSensor.LeakDetected}, dry: ${this.device.dry}, OpenAPI`) : this.debugLog(`LeakDetected: ${this.LeakSensor.LeakDetected}, dry: ${this.device.dry}, OpenAPI`);
        }
        // BatteryLevel
        this.Battery.BatteryLevel = this.deviceStatus.battery;
        this.debugLog(`BatteryLevel: ${this.Battery.BatteryLevel}`);
        // StatusLowBattery
        this.Battery.StatusLowBattery = this.Battery.BatteryLevel < 10
            ? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        this.debugLog(`StatusLowBattery: ${this.Battery.StatusLowBattery}`);
        // FirmwareVersion
        if (this.deviceStatus.version) {
            const version = this.deviceStatus.version.toString();
            this.debugLog(`FirmwareVersion: ${version.replace(/^V|-.*$/g, '')}`);
            const deviceVersion = version.replace(/^V|-.*$/g, '') ?? '0.0.0';
            this.accessory
                .getService(this.hap.Service.AccessoryInformation)
                .setCharacteristic(this.hap.Characteristic.HardwareRevision, deviceVersion)
                .setCharacteristic(this.hap.Characteristic.FirmwareRevision, deviceVersion)
                .getCharacteristic(this.hap.Characteristic.FirmwareRevision)
                .updateValue(deviceVersion);
            this.accessory.context.version = deviceVersion;
            this.debugSuccessLog(`version: ${this.accessory.context.version}`);
        }
    }
    async parseStatusWebhook() {
        this.debugLog('parseStatusWebhook');
        this.debugLog(`(detectionState, battery) = Webhook: (${this.webhookContext.detectionState}, ${this.webhookContext.battery}), current:(${this.LeakSensor?.LeakDetected}, ${this.Battery.BatteryLevel})`);
        // LeakSensor
        if (!this.device.hide_leak && this.LeakSensor?.Service) {
            // StatusActive
            this.LeakSensor.StatusActive = !!this.webhookContext.detectionState;
            this.debugLog(`StatusActive: ${this.LeakSensor.StatusActive}`);
            // LeakDetected
            this.LeakSensor.LeakDetected = this.device.dry
                ? this.webhookContext.detectionState === 0 ? this.hap.Characteristic.LeakDetected.LEAK_DETECTED : this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED
                : this.webhookContext.detectionState === 1 ? this.hap.Characteristic.LeakDetected.LEAK_DETECTED : this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED;
            this.LeakSensor.LeakDetected === this.hap.Characteristic.LeakDetected.LEAK_DETECTED ? this.warnLog(`LeakDetected: ${this.LeakSensor.LeakDetected}, dry: ${this.device.dry}, Webhook`) : this.debugLog(`LeakDetected: ${this.LeakSensor.LeakDetected}, dry: ${this.device.dry}, Webhook`);
        }
        // BatteryLevel
        this.Battery.BatteryLevel = this.webhookContext.battery;
        this.debugLog(`BatteryLevel: ${this.Battery.BatteryLevel}`);
        // StatusLowBattery
        this.Battery.StatusLowBattery = this.Battery.BatteryLevel < 10
            ? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        this.debugLog(`StatusLowBattery: ${this.Battery.StatusLowBattery}`);
    }
    /**
     * Asks the SwitchBot API for the latest device information
     */
    async refreshStatus() {
        if (!this.device.enableCloudService && this.OpenAPI) {
            this.errorLog(`refreshStatus enableCloudService: ${this.device.enableCloudService}`);
        }
        else if (this.BLE) {
            await this.BLERefreshStatus();
        }
        else if (this.OpenAPI && this.platform.config.credentials?.token) {
            await this.openAPIRefreshStatus();
        }
        else {
            await this.offlineOff();
            this.debugWarnLog(`Connection Type: ${this.device.connectionType}, refreshStatus will not happen.`);
        }
    }
    async BLERefreshStatus() {
        this.debugLog('BLERefreshStatus');
        const switchBotBLE = await this.switchbotBLE();
        if (switchBotBLE === undefined) {
            await this.BLERefreshConnection(switchBotBLE);
        }
        else {
            // Start to monitor advertisement packets
            (async () => {
                // Start to monitor advertisement packets
                const serviceData = await this.monitorAdvertisementPackets(switchBotBLE);
                // Update HomeKit
                if (serviceData.model === SwitchBotBLEModel.Leak && serviceData.modelName === SwitchBotBLEModelName.Leak) {
                    this.serviceData = serviceData;
                    if (serviceData !== undefined || serviceData !== null) {
                        await this.BLEparseStatus();
                        await this.updateHomeKitCharacteristics();
                    }
                    else {
                        this.errorLog(`serviceData is either undefined or null, serviceData: ${JSON.stringify(serviceData)}`);
                        await this.BLERefreshConnection(switchBotBLE);
                    }
                }
                else {
                    this.errorLog(`failed to get serviceData, serviceData: ${JSON.stringify(serviceData)}`);
                    await this.BLERefreshConnection(switchBotBLE);
                }
            })();
        }
    }
    async registerPlatformBLE() {
        this.debugLog('registerPlatformBLE');
        if (this.config.options?.BLE && !this.device.disablePlatformBLE) {
            this.debugLog('is listening to Platform BLE.');
            try {
                const formattedDeviceId = formatDeviceIdAsMac(this.device.deviceId);
                this.device.bleMac = formattedDeviceId;
                this.debugLog(`bleMac: ${this.device.bleMac}`);
                this.platform.bleEventHandler[this.device.bleMac] = async (context) => {
                    try {
                        this.serviceData = context;
                        if (context !== undefined || context !== null) {
                            this.debugLog(`received BLE: ${JSON.stringify(context)}`);
                            await this.BLEparseStatus();
                            await this.updateHomeKitCharacteristics();
                        }
                        else {
                            this.errorLog(`context is either undefined or null, context: ${JSON.stringify(context)}`);
                            await this.BLERefreshConnection(context);
                        }
                    }
                    catch (e) {
                        this.errorLog(`failed to handle BLE. Received: ${JSON.stringify(context)} Error: ${e.message ?? e}`);
                    }
                };
            }
            catch (error) {
                this.errorLog(`failed to format device ID as MAC, Error: ${error}`);
            }
        }
        else {
            this.debugLog('is not listening to Platform BLE');
        }
    }
    async openAPIRefreshStatus() {
        this.debugLog('openAPIRefreshStatus');
        try {
            const response = await this.deviceRefreshStatus();
            const deviceStatus = response.body;
            this.debugLog(`statusCode: ${deviceStatus.statusCode}, deviceStatus: ${JSON.stringify(deviceStatus)}`);
            if (await this.successfulStatusCodes(deviceStatus)) {
                this.debugSuccessLog(`statusCode: ${deviceStatus.statusCode}, deviceStatus: ${JSON.stringify(deviceStatus)}`);
                this.deviceStatus = deviceStatus.body;
                await this.openAPIparseStatus();
                await this.updateHomeKitCharacteristics();
            }
            else {
                this.debugWarnLog(`statusCode: ${deviceStatus.statusCode}, deviceStatus: ${JSON.stringify(deviceStatus)}`);
            }
        }
        catch (e) {
            await this.apiError(e);
            this.errorLog(`failed openAPIRefreshStatus with ${this.device.connectionType} Connection, Error Message: ${JSON.stringify(e.message)}`);
        }
    }
    async registerWebhook() {
        if (this.device.webhook) {
            this.debugLog('is listening webhook.');
            this.platform.webhookEventHandler[this.device.deviceId] = async (context) => {
                try {
                    this.webhookContext = context;
                    if (context !== undefined || context !== null) {
                        this.debugLog(`received Webhook: ${JSON.stringify(context)}`);
                        await this.parseStatusWebhook();
                        await this.updateHomeKitCharacteristics();
                    }
                    else {
                        this.errorLog(`context is either undefined or null, context: ${JSON.stringify(context)}`);
                    }
                }
                catch (e) {
                    this.errorLog(`failed to handle webhook. Received: ${JSON.stringify(context)} Error: ${e.message ?? e}`);
                }
            };
        }
        else {
            this.debugLog('is not listening webhook.');
        }
    }
    /**
     * Updates the status for each of the HomeKit Characteristics
     */
    async updateHomeKitCharacteristics() {
        if (!this.device.hide_leak && this.LeakSensor?.Service) {
            // StatusActive
            await this.updateCharacteristic(this.LeakSensor.Service, this.hap.Characteristic.StatusActive, this.LeakSensor.StatusActive, 'StatusActive');
            // LeakDetected
            await this.updateCharacteristic(this.LeakSensor.Service, this.hap.Characteristic.LeakDetected, this.LeakSensor.LeakDetected, 'LeakDetected');
        }
        // BatteryLevel
        await this.updateCharacteristic(this.Battery.Service, this.hap.Characteristic.BatteryLevel, this.Battery.BatteryLevel, 'BatteryLevel');
        // StatusLowBattery
        await this.updateCharacteristic(this.Battery.Service, this.hap.Characteristic.StatusLowBattery, this.Battery.StatusLowBattery, 'StatusLowBattery');
    }
    async BLERefreshConnection(switchbot) {
        this.errorLog(`wasn't able to establish BLE Connection, node-switchbot: ${switchbot}`);
        if (this.platform.config.credentials?.token && this.device.connectionType === 'BLE/OpenAPI') {
            this.warnLog('Using OpenAPI Connection to Refresh Status');
            await this.openAPIRefreshStatus();
        }
    }
    async offlineOff() {
        if (this.device.offline) {
            if (!this.device.hide_leak && this.LeakSensor?.Service) {
                this.LeakSensor.Service.updateCharacteristic(this.hap.Characteristic.StatusActive, false);
                this.LeakSensor.Service.updateCharacteristic(this.hap.Characteristic.LeakDetected, this.hap.Characteristic.LeakDetected.LEAK_NOT_DETECTED);
            }
        }
    }
    async apiError(e) {
        if (!this.device.hide_leak && this.LeakSensor?.Service) {
            this.LeakSensor.Service.updateCharacteristic(this.hap.Characteristic.StatusActive, e);
            this.LeakSensor.Service.updateCharacteristic(this.hap.Characteristic.LeakDetected, e);
        }
        this.Battery.Service.updateCharacteristic(this.hap.Characteristic.BatteryLevel, e);
        this.Battery.Service.updateCharacteristic(this.hap.Characteristic.StatusLowBattery, e);
    }
}
//# sourceMappingURL=waterdetector.js.map