/*
* For Testing Locally:
* import { SwitchBotBLEModel, SwitchBotBLEModelName } from '/Users/Shared/GitHub/OpenWonderLabs/node-switchbot/dist/index.js';
*/
import { SwitchBotBLEModel, SwitchBotBLEModelName, WoHand } from 'node-switchbot';
import { debounceTime, interval, skipWhile, Subject, take, tap } from 'rxjs';
import { buildBotBleCommand, formatDeviceIdAsMac, validateBotPassword } from '../utils.js';
import { deviceBase } from './device.js';
function normalizeBleAddress(address) {
    return address.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function isDiscoveryTimeoutError(error) {
    const message = `${error?.message ?? error}`.toLowerCase();
    return message.includes('discovery timeout') || message.includes('no switchbot devices found');
}
async function discoverBotByAddress(switchBotBLE, bleMac, durationMs) {
    const noble = switchBotBLE?.noble;
    if (!noble) {
        throw new Error('Noble BLE object is unavailable for address-based fallback discovery');
    }
    const targetAddress = normalizeBleAddress(bleMac);
    const wasScanning = Boolean(noble.scanning);
    return await new Promise((resolve, reject) => {
        let settled = false;
        let timer;
        let onDiscover;
        const finish = async (error, device) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timer);
            noble.off('discover', onDiscover);
            if (!wasScanning) {
                try {
                    await noble.stopScanningAsync();
                }
                catch {
                    // ignore stop scan errors in fallback cleanup path
                }
            }
            if (error) {
                reject(error);
            }
            else if (device) {
                resolve(device);
            }
            else {
                reject(new Error('Address-based fallback discovery ended without a result'));
            }
        };
        timer = setTimeout(() => {
            void finish(new Error(`No SwitchBot device found by address ${bleMac} after ${durationMs}ms`));
        }, durationMs);
        onDiscover = (peripheral) => {
            const candidateAddress = normalizeBleAddress(peripheral?.address ?? peripheral?.id ?? '');
            if (candidateAddress === targetAddress) {
                void finish(undefined, new WoHand(peripheral, noble));
            }
        };
        noble.on('discover', onDiscover);
        if (!wasScanning) {
            noble.startScanningAsync([], false).catch((e) => {
                void finish(new Error(`Failed to start address-based fallback scan: ${e?.message ?? e}`));
            });
        }
    });
}
export async function executeBotBleAction(device, action, password) {
    if (!password) {
        if (action === 0x00) {
            await device.press();
            return;
        }
        if (action === 0x01) {
            await device.turnOn();
            return;
        }
        await device.turnOff();
        return;
    }
    validateBotPassword(password);
    const reqBuf = buildBotBleCommand(action, password);
    const resBuf = await device.command(reqBuf);
    const code = resBuf.readUInt8(0);
    if (resBuf.length !== 3 || (code !== 0x01 && code !== 0x05)) {
        throw new Error(`The device returned an error: 0x${resBuf.toString('hex')}`);
    }
}
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Bot extends deviceBase {
    platform;
    // Services
    Battery;
    Switch;
    GarageDoor;
    Door;
    Window;
    WindowCovering;
    LockMechanism;
    Faucet;
    Fan;
    StatefulProgrammableSwitch;
    Outlet;
    On;
    // OpenAPI
    deviceStatus;
    // Webhook
    webhookContext;
    // BLE
    serviceData;
    // Config
    botMode;
    allowPush;
    doublePress;
    botDeviceType;
    pushRatePress;
    multiPressCount;
    // Updates
    botUpdateInProgress;
    doBotUpdate;
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
    constructor(platform, accessory, device) {
        super(platform, accessory, device);
        this.platform = platform;
        this.getBotConfigSettings(device);
        // this is subject we use to track when we need to POST changes to the SwitchBot API
        this.doBotUpdate = new Subject();
        this.botUpdateInProgress = false;
        // Initialize Battery property
        accessory.context.Battery = accessory.context.Battery ?? {};
        this.Battery = {
            Name: `${accessory.displayName} Battery`,
            Service: accessory.getService(this.hap.Service.Battery) ?? accessory.addService(this.hap.Service.Battery),
            BatteryLevel: accessory.context.BatteryLevel ?? 100,
            StatusLowBattery: accessory.context.StatusLowBattery ?? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
        };
        accessory.context.Battery = this.Battery;
        // Initialize Battery Characteristics
        this.Battery.Service.setCharacteristic(this.hap.Characteristic.Name, this.Battery.Name).setCharacteristic(this.hap.Characteristic.StatusLowBattery, this.Battery.StatusLowBattery).setCharacteristic(this.hap.Characteristic.ChargingState, this.hap.Characteristic.ChargingState.NOT_CHARGEABLE);
        /**
         * A mapping of device types to their corresponding HomeKit categories, services, and characteristics.
         *
         * Each key represents a device type and maps to an object containing:
         * - `category`: The HomeKit category for the device.
         * - `service`: The HomeKit service associated with the device.
         * - `characteristic`: The HomeKit characteristic for the device.
         */
        const deviceTypeMap = {
            switch: { category: 8 /* this.hap.Categories.SWITCH */, service: this.hap.Service.Switch, characteristic: this.hap.Characteristic.On },
            garagedoor: { category: 4 /* this.hap.Categories.GARAGE_DOOR_OPENER */, service: this.hap.Service.GarageDoorOpener, characteristic: this.hap.Characteristic.TargetDoorState },
            door: { category: 12 /* this.hap.Categories.DOOR */, service: this.hap.Service.Door, characteristic: this.hap.Characteristic.TargetPosition },
            window: { category: 13 /* this.hap.Categories.WINDOW */, service: this.hap.Service.Window, characteristic: this.hap.Characteristic.TargetPosition },
            windowcovering: { category: 14 /* this.hap.Categories.WINDOW_COVERING */, service: this.hap.Service.WindowCovering, characteristic: this.hap.Characteristic.TargetPosition },
            lock: { category: 6 /* this.hap.Categories.DOOR_LOCK */, service: this.hap.Service.LockMechanism, characteristic: this.hap.Characteristic.LockTargetState },
            faucet: { category: 29 /* this.hap.Categories.FAUCET */, service: this.hap.Service.Faucet, characteristic: this.hap.Characteristic.Active },
            fan: { category: 3 /* this.hap.Categories.FAN */, service: this.hap.Service.Fanv2, characteristic: this.hap.Characteristic.Active },
            stateful: { category: 15 /* this.hap.Categories.PROGRAMMABLE_SWITCH */, service: this.hap.Service.StatefulProgrammableSwitch, characteristic: this.hap.Characteristic.ProgrammableSwitchOutputState },
            outlet: { category: 7 /* this.hap.Categories.OUTLET */, service: this.hap.Service.Outlet, characteristic: this.hap.Characteristic.On },
        };
        /**
         * The type of the device, determined by mapping the botDeviceType to a value in the deviceTypeMap.
         */
        const deviceType = deviceTypeMap[this.botDeviceType];
        if (deviceType) {
            // Set category
            accessory.category = deviceType.category;
            // Initialize Service
            const contextKey = this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1);
            accessory.context[contextKey] = accessory.context[contextKey] ?? {};
            this[this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1)] = {
                Name: accessory.displayName,
                Service: accessory.getService(deviceType.service) ?? accessory.addService(deviceType.service),
            };
            accessory.context[contextKey] = this[this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1)];
            this.debugLog(`Displaying as ${contextKey}`);
            // Initialize Characteristics
            this[this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1)].Service.setCharacteristic(this.hap.Characteristic.Name, this[this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1)].Name).getCharacteristic(deviceType.characteristic).onSet(this.OnSet.bind(this));
        }
        else {
            this.errorLog('Device Type not set');
        }
        /**
         * An array of service removal functions that should be executed based on the current state of the device.
         * Each element in the array is a function that removes a specific service if the corresponding condition is met.
         */
        const servicesToRemove = [
            !this.StatefulProgrammableSwitch && this.removeStatefulProgrammableSwitchService,
            !this.Outlet && this.removeOutletService,
            !this.Window && this.removeWindowService,
            !this.GarageDoor && this.removeGarageDoorService,
            this.WindowCovering && this.removeWindowCoveringService,
            !this.Switch && this.removeSwitchService,
            !this.Faucet && this.removeFaucetService,
            !this.Door && this.removeDoorService,
            !this.LockMechanism && this.removeLockService,
            !this.Fan && this.removeFanService,
        ].filter(Boolean);
        for (const removeService of servicesToRemove) {
            if (typeof removeService === 'function') {
                removeService.call(this, accessory);
            }
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
            .pipe(skipWhile(() => this.botUpdateInProgress))
            .subscribe(async () => {
            await this.refreshStatus();
        });
        // Watch for Bot change events
        // We put in a debounce of 1000ms so we don't make duplicate calls
        this.doBotUpdate
            .pipe(tap(() => {
            this.botUpdateInProgress = true;
        }), debounceTime(this.devicePushRate * 1000))
            .subscribe(async () => {
            try {
                if (this.doublePress > 1) {
                    interval(this.pushRatePress * 1000)
                        .pipe(take(this.doublePress))
                        .subscribe(async () => {
                        await this.pushChanges();
                    });
                }
                else {
                    await this.pushChanges();
                }
            }
            catch (e) {
                await this.apiError(e);
                this.errorLog(`failed pushChanges with ${device.connectionType} Connection, Error Message: ${JSON.stringify(e.message)}`);
            }
            this.botUpdateInProgress = false;
        });
    }
    /**
     * Parse the device status from the SwitchBotBLE API
     */
    async BLEparseStatus() {
        this.debugLog('BLEparseStatus');
        this.debugLog(`(power, battery, deviceMode) = BLE:(${this.serviceData.state}, ${this.serviceData.battery}, ${this.serviceData.mode}), current:(${this.accessory.context.On}, ${this.Battery.BatteryLevel}, ${this.botMode})`);
        // BLEmode (true if Switch Mode) | (false if Press Mode)
        this.On = this.serviceData.mode ? this.serviceData.state : false;
        const mode = this.serviceData.mode ? 'Switch' : 'Press';
        this.debugLog(`${mode} Mode, On: ${this.On}`);
        this.accessory.context.On = this.On;
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
    /**
     * Parse the device status from the SwitchBot OpenAPI
     */
    async openAPIparseStatus() {
        this.debugLog('openAPIparseStatus');
        this.debugLog(`(power, battery, deviceMode) = API:(${this.deviceStatus.power}, ${this.deviceStatus.battery}, ${this.botMode}), current:(${this.accessory.context.On}, ${this.Battery.BatteryLevel}, ${this.botMode})`);
        // On
        this.On = this.botMode === 'press' ? false : this.deviceStatus.power === 'on';
        this.debugLog(`On: ${this.On}`);
        this.accessory.context.On = this.On;
        // Battery Level
        this.Battery.BatteryLevel = this.deviceStatus.battery;
        this.debugLog(`BatteryLevel: ${this.Battery.BatteryLevel}`);
        // StatusLowBattery
        this.Battery.StatusLowBattery = this.Battery.BatteryLevel < 10
            ? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        this.debugLog(`StatusLowBattery: ${this.Battery.StatusLowBattery}`);
        // Firmware Version
        if (this.deviceStatus.version) {
            const version = this.deviceStatus.version.toString();
            this.debugLog(`Firmware Version: ${version.replace(/^V|-.*$/g, '')}`);
            const deviceVersion = version.replace(/^V|-.*$/g, '') ?? '0.0.0';
            this.accessory
                .getService(this.hap.Service.AccessoryInformation)
                .setCharacteristic(this.hap.Characteristic.HardwareRevision, deviceVersion)
                .setCharacteristic(this.hap.Characteristic.FirmwareRevision, deviceVersion)
                .getCharacteristic(this.hap.Characteristic.FirmwareRevision)
                .updateValue(deviceVersion);
            this.accessory.context.version = deviceVersion;
            this.debugLog(`version: ${deviceVersion}`);
        }
    }
    async parseStatusWebhook() {
        this.debugLog('parseStatusWebhook');
        this.debugLog(`(power, battery, deviceMode) = Webhook:(${this.webhookContext.power}, ${this.webhookContext.battery}, ${this.webhookContext.deviceMode}), current:(${this.On}, ${this.Battery.BatteryLevel}, ${this.botMode})`);
        // On
        this.On = this.webhookContext.power === 'on';
        this.debugLog(`On: ${this.On}`);
        // BatteryLevel
        this.Battery.BatteryLevel = this.webhookContext.battery;
        this.debugLog(`BatteryLevel: ${this.Battery.BatteryLevel}`);
        // StatusLowBattery
        this.Battery.StatusLowBattery = this.Battery.BatteryLevel < 10
            ? this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        this.debugLog(`StatusLowBattery: ${this.Battery.StatusLowBattery}`);
        // Mode
        this.botMode = this.webhookContext.deviceMode;
        this.debugLog(`Mode: ${this.botMode}`);
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
                if (serviceData.model === SwitchBotBLEModel.Bot && serviceData.modelName === SwitchBotBLEModelName.Bot) {
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
     * Pushes the requested changes to the SwitchBot API
     * deviceType  commandType  Command    command parameter  Description
     * Bot         "command"    "turnOff"  "default"      =   set to OFF state
     * Bot         "command"    "turnOn"   "default"      =   set to ON state
     * Bot         "command"    "press"    "default"      =   trigger press
     */
    async pushChanges() {
        if (!this.device.enableCloudService && this.OpenAPI) {
            this.errorLog(`pushChanges enableCloudService: ${this.device.enableCloudService}`);
        }
        else if (this.BLE) {
            await this.BLEpushChanges();
        }
        else if (this.OpenAPI && this.platform.config.credentials?.token) {
            await this.openAPIpushChanges();
        }
        else {
            await this.offlineOff();
            this.debugWarnLog(`Connection Type: ${this.device.connectionType}, pushChanges will not happen.`);
        }
        // Refresh the status from the API
        interval(15000)
            .pipe(skipWhile(() => this.botUpdateInProgress))
            .pipe(take(1))
            .subscribe(async () => {
            await this.refreshStatus();
        });
    }
    async discoverBotDeviceWithFallback(switchBotBLE, botPassword) {
        const bleMac = this.device.bleMac ?? formatDeviceIdAsMac(this.device.deviceId);
        try {
            const deviceList = await switchBotBLE.discover({ model: this.device.bleModel, quick: true, id: bleMac });
            if (deviceList.length === 0) {
                throw new Error('No device found');
            }
            return deviceList[0];
        }
        catch (e) {
            if (botPassword && isDiscoveryTimeoutError(e)) {
                this.warnLog(`Bot discovery by model timed out for ${this.device.deviceId}. Trying address-based fallback discovery.`);
                return await discoverBotByAddress(switchBotBLE, bleMac, this.scanDuration * 1000);
            }
            throw e;
        }
    }
    async BLEpushChanges() {
        this.debugLog('BLEpushChanges');
        if ((this.On !== this.accessory.context.On) || this.allowPush) {
            this.debugLog(`BLEpushChanges On: ${this.On} OnCached: ${this.accessory.context.On}`);
            const switchBotBLE = this.platform.switchBotBLE;
            const botPassword = this.device.password;
            if (botPassword) {
                try {
                    validateBotPassword(botPassword);
                }
                catch (e) {
                    this.errorLog(`Invalid Bot password config for ${this.device.deviceId}: ${e.message ?? e}`);
                    return;
                }
            }
            try {
                const formattedDeviceId = formatDeviceIdAsMac(this.device.deviceId);
                this.device.bleMac = formattedDeviceId;
                this.debugLog(`bleMac: ${this.device.bleMac}`);
                // if (switchBotBLE !== false) {
                this.debugLog(`Bot Mode: ${this.botMode}`);
                if (this.botMode === 'press') {
                    try {
                        const botDevice = await this.discoverBotDeviceWithFallback(switchBotBLE, botPassword);
                        this.infoLog(`On: ${this.On}`);
                        await executeBotBleAction(botDevice, 0x00, botPassword);
                        this.successLog(`On: ${this.On} sent over SwitchBot BLE, sent successfully`);
                        await this.updateHomeKitCharacteristics();
                        setTimeout(async () => {
                            this.On = false;
                            await this.updateHomeKitCharacteristics();
                            this.debugLog(`On: ${this.On}, Switch Timeout`);
                        }, 500);
                    }
                    catch (e) {
                        await this.apiError(e);
                        if (botPassword && !isDiscoveryTimeoutError(e)) {
                            this.errorLog(`Bot BLE password command failed for ${this.device.deviceId}. Verify password and BLE response.`);
                        }
                        if (isDiscoveryTimeoutError(e)) {
                            this.errorLog(`Bot BLE discovery failed for ${this.device.deviceId}. Device was not discovered before timeout.`);
                        }
                        this.errorLog(`failed BLEpushChanges with ${this.device.connectionType} Connection, Error Message: ${JSON.stringify(e.message)}`);
                        await this.BLEPushConnection();
                    }
                }
                else if (this.botMode === 'switch') {
                    try {
                        const botDevice = await this.discoverBotDeviceWithFallback(switchBotBLE, botPassword);
                        this.infoLog(`On: ${this.On}`);
                        this.warnLog(`device: ${JSON.stringify({ id: botDevice.id, address: botDevice.address, model: botDevice.model })}`);
                        await this.retryBLE({
                            max: this.maxRetryBLE(),
                            fn: async () => {
                                if (this.On) {
                                    return await executeBotBleAction(botDevice, 0x01, botPassword);
                                }
                                else {
                                    return await executeBotBleAction(botDevice, 0x02, botPassword);
                                }
                            },
                        });
                        this.successLog(`On: ${this.On} sent over SwitchBot BLE, sent successfully`);
                        await this.updateHomeKitCharacteristics();
                    }
                    catch (e) {
                        await this.apiError(e);
                        if (botPassword && !isDiscoveryTimeoutError(e)) {
                            this.errorLog(`Bot BLE password command failed for ${this.device.deviceId}. Verify password and BLE response.`);
                        }
                        if (isDiscoveryTimeoutError(e)) {
                            this.errorLog(`Bot BLE discovery failed for ${this.device.deviceId}. Device was not discovered before timeout.`);
                        }
                        this.errorLog(`failed BLEpushChanges with ${this.device.connectionType} Connection, Error Message: ${JSON.stringify(e.message)}`);
                        await this.BLEPushConnection();
                    }
                }
                else {
                    this.errorLog(`Device Parameters not set for this Bot, please check the device configuration. Bot Mode: ${this.botMode}`);
                }
            }
            catch (error) {
                this.errorLog(`failed to format device ID as MAC, Error: ${error}`);
            }
        }
        else {
            this.debugLog(`No Changes (BLEpushChanges), On: ${this.On} OnCached: ${this.accessory.context.On}`);
        }
    }
    async openAPIpushChanges() {
        this.debugLog('openAPIpushChanges');
        if (this.multiPressCount > 0) {
            this.debugLog(`${this.multiPressCount} request(s) queued.`);
        }
        if ((this.On !== this.accessory.context.On) || this.allowPush || this.multiPressCount > 0) {
            let command = '';
            if (this.botMode === 'switch') {
                command = this.On ? 'turnOn' : 'turnOff';
                this.debugLog(`Switch Mode, Command: ${command}`);
            }
            else if (this.botMode === 'press' || this.botMode === 'multipress') {
                command = 'press';
                this.debugLog('Press Mode');
                this.On = false;
            }
            else {
                throw new Error('Device Parameters not set for this Bot.');
            }
            const bodyChange = {
                command: `${command}`,
                parameter: 'default',
                commandType: 'command',
            };
            this.debugLog(`SwitchBot OpenAPI bodyChange: ${JSON.stringify(bodyChange)}`);
            try {
                const response = await this.pushChangeRequest(bodyChange);
                const deviceStatus = response.body;
                this.debugLog(`statusCode: ${deviceStatus.statusCode}, deviceStatus: ${JSON.stringify(deviceStatus)}`);
                if (await this.successfulStatusCodes(deviceStatus)) {
                    this.debugSuccessLog(`statusCode: ${deviceStatus.statusCode}, deviceStatus: ${JSON.stringify(deviceStatus)}`);
                    await this.updateHomeKitCharacteristics();
                }
                else {
                    await this.statusCode(deviceStatus.statusCode);
                }
                if (this.device.mode === 'multipress') {
                    this.multiPressCount--;
                    if (this.multiPressCount > 0) {
                        this.debugLog(`multiPressCount: ${this.multiPressCount}`);
                        this.On = true;
                        await this.openAPIpushChanges();
                    }
                }
            }
            catch (e) {
                await this.apiError(e);
                this.errorLog(`failed openAPIpushChanges with ${this.device.connectionType} Connection, Error Message: ${JSON.stringify(e.message)}`);
            }
        }
        else {
            this.debugLog(`No Changes (openAPIpushChanges), On: ${this.On} OnCached: ${this.accessory.context.On}`);
        }
    }
    /**
     * Handle requests to set the "On" characteristic
     */
    async OnSet(value) {
        this.debugLog(`value: ${value}`);
        const deviceTypeActions = {
            switch: () => this.On = value !== false,
            garagedoor: () => this.On = value !== this.hap.Characteristic.TargetDoorState.CLOSED,
            door: () => this.On = value !== 0,
            window: () => this.On = value !== 0,
            windowcovering: () => this.On = value !== 0,
            lock: () => this.On = value !== this.hap.Characteristic.LockTargetState.SECURED,
            faucet: () => this.On = value !== this.hap.Characteristic.Active.INACTIVE,
            fan: () => this.On = value !== 0,
            stateful: () => this.On = value !== 0,
            default: () => {
                this.On = value !== false;
                if (this.device.mode === 'multipress' && this.On) {
                    this.multiPressCount++;
                    this.debugLog(`multiPressCount: ${this.multiPressCount}`);
                }
            },
        };
        const action = deviceTypeActions[this.botDeviceType] || deviceTypeActions.default;
        action();
        this.doBotUpdate.next();
    }
    /**
     * Updates the status for each of the HomeKit Characteristics
     */
    async updateHomeKitCharacteristics() {
        this.debugLog('updateHomeKitCharacteristics');
        // BatteryLevel
        if (this.Battery.BatteryLevel === undefined) {
            this.debugLog(`BatteryLevel: ${this.Battery.BatteryLevel}`);
        }
        else {
            this.accessory.context.BatteryLevel = this.Battery.BatteryLevel;
            this.Battery.Service.updateCharacteristic(this.hap.Characteristic.BatteryLevel, this.Battery.BatteryLevel);
            this.debugLog(`updateCharacteristic BatteryLevel: ${this.Battery.BatteryLevel}`);
        }
        // StatusLowBattery
        if (this.Battery.StatusLowBattery === undefined) {
            this.debugLog(`StatusLowBattery: ${this.Battery.StatusLowBattery}`);
        }
        else {
            this.accessory.context.StatusLowBattery = this.Battery.StatusLowBattery;
            this.Battery.Service.updateCharacteristic(this.hap.Characteristic.StatusLowBattery, this.Battery.StatusLowBattery);
            this.debugLog(`updateCharacteristic StatusLowBattery: ${this.Battery.StatusLowBattery}`);
        }
        // State
        const updateCharacteristic = async (service, characteristic, value, logMessage) => {
            service.updateCharacteristic(characteristic, value);
            this.debugLog(logMessage);
        };
        const stateActions = {
            switch: async () => this.Switch && await updateCharacteristic(this.Switch.Service, this.hap.Characteristic.On, this.On, `updateCharacteristic On: ${this.On}`),
            garagedoor: async () => {
                if (this.GarageDoor) {
                    const targetState = this.On ? this.hap.Characteristic.TargetDoorState.OPEN : this.hap.Characteristic.TargetDoorState.CLOSED;
                    const currentState = this.On ? this.hap.Characteristic.CurrentDoorState.OPEN : this.hap.Characteristic.CurrentDoorState.CLOSED;
                    await updateCharacteristic(this.GarageDoor.Service, this.hap.Characteristic.TargetDoorState, targetState, `updateCharacteristic TargetDoorState: ${targetState}, CurrentDoorState: ${currentState} (${this.On})`);
                    await updateCharacteristic(this.GarageDoor.Service, this.hap.Characteristic.CurrentDoorState, currentState, '');
                }
            },
            door: async () => {
                if (this.Door) {
                    const position = this.On ? 100 : 0;
                    await updateCharacteristic(this.Door.Service, this.hap.Characteristic.TargetPosition, position, `updateCharacteristic TargetPosition: ${position}, CurrentPosition: ${position} (${this.On})`);
                    await updateCharacteristic(this.Door.Service, this.hap.Characteristic.CurrentPosition, position, '');
                    await updateCharacteristic(this.Door.Service, this.hap.Characteristic.PositionState, this.hap.Characteristic.PositionState.STOPPED, '');
                }
            },
            window: async () => {
                if (this.Window) {
                    const position = this.On ? 100 : 0;
                    await updateCharacteristic(this.Window.Service, this.hap.Characteristic.TargetPosition, position, `updateCharacteristic TargetPosition: ${position}, CurrentPosition: ${position} (${this.On})`);
                    await updateCharacteristic(this.Window.Service, this.hap.Characteristic.CurrentPosition, position, '');
                    await updateCharacteristic(this.Window.Service, this.hap.Characteristic.PositionState, this.hap.Characteristic.PositionState.STOPPED, '');
                }
            },
            windowcovering: async () => {
                if (this.WindowCovering) {
                    const position = this.On ? 100 : 0;
                    await updateCharacteristic(this.WindowCovering.Service, this.hap.Characteristic.TargetPosition, position, `updateCharacteristic TargetPosition: ${position}, CurrentPosition: ${position} (${this.On})`);
                    await updateCharacteristic(this.WindowCovering.Service, this.hap.Characteristic.CurrentPosition, position, '');
                    await updateCharacteristic(this.WindowCovering.Service, this.hap.Characteristic.PositionState, this.hap.Characteristic.PositionState.STOPPED, '');
                }
            },
            lock: async () => {
                if (this.LockMechanism) {
                    const targetState = this.On ? this.hap.Characteristic.LockTargetState.UNSECURED : this.hap.Characteristic.LockTargetState.SECURED;
                    const currentState = this.On ? this.hap.Characteristic.LockCurrentState.UNSECURED : this.hap.Characteristic.LockCurrentState.SECURED;
                    await updateCharacteristic(this.LockMechanism.Service, this.hap.Characteristic.LockTargetState, targetState, `updateCharacteristic LockTargetState: ${targetState}, LockCurrentState: ${currentState} (${this.On})`);
                    await updateCharacteristic(this.LockMechanism.Service, this.hap.Characteristic.LockCurrentState, currentState, '');
                }
            },
            faucet: async () => this.Faucet && await updateCharacteristic(this.Faucet.Service, this.hap.Characteristic.Active, this.On ? this.hap.Characteristic.Active.ACTIVE : this.hap.Characteristic.Active.INACTIVE, `updateCharacteristic Active: ${this.On}`),
            fan: async () => this.Fan && await updateCharacteristic(this.Fan.Service, this.hap.Characteristic.Active, this.On ? this.hap.Characteristic.Active.ACTIVE : this.hap.Characteristic.Active.INACTIVE, `updateCharacteristic Active: ${this.On}`),
            stateful: async () => {
                if (this.StatefulProgrammableSwitch) {
                    await updateCharacteristic(this.StatefulProgrammableSwitch.Service, this.hap.Characteristic.ProgrammableSwitchEvent, this.hap.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS, `updateCharacteristic ProgrammableSwitchEvent: SINGLE_PRESS (${this.On})`);
                    await updateCharacteristic(this.StatefulProgrammableSwitch.Service, this.hap.Characteristic.ProgrammableSwitchOutputState, this.On ? 1 : 0, `updateCharacteristic ProgrammableSwitchOutputState: ${this.On ? 1 : 0}`);
                }
            },
            outlet: async () => this.Outlet && await updateCharacteristic(this.Outlet.Service, this.hap.Characteristic.On, this.On, `updateCharacteristic On: ${this.On}`),
            default: async () => this.errorLog(`botDeviceType: ${this.botDeviceType}, On: ${this.On}`),
        };
        const action = stateActions[this.botDeviceType] || stateActions.default;
        await action();
    }
    async removeService(accessory, serviceType, serviceName) {
        const contextKey = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
        accessory.context[contextKey] = accessory.context[contextKey] ?? {};
        this[contextKey] = {
            Name: accessory.context[contextKey].Name ?? accessory.displayName,
            Service: accessory.getService(this.hap.Service[serviceType]),
        };
        accessory.context[contextKey] = this[contextKey];
        this.debugWarnLog(`Removing any leftover ${contextKey} Service`);
        accessory.removeService(this[contextKey].Service);
    }
    async removeOutletService(accessory) {
        await this.removeService(accessory, 'Outlet', 'outlet');
    }
    async removeGarageDoorService(accessory) {
        await this.removeService(accessory, 'GarageDoorOpener', 'garageDoor');
    }
    async removeDoorService(accessory) {
        await this.removeService(accessory, 'Door', 'door');
    }
    async removeLockService(accessory) {
        await this.removeService(accessory, 'LockMechanism', 'lockMechanism');
    }
    async removeFaucetService(accessory) {
        await this.removeService(accessory, 'Valve', 'faucet');
    }
    async removeFanService(accessory) {
        await this.removeService(accessory, 'Fan', 'fan');
    }
    async removeWindowService(accessory) {
        await this.removeService(accessory, 'Window', 'window');
    }
    async removeWindowCoveringService(accessory) {
        await this.removeService(accessory, 'WindowCovering', 'windowCovering');
    }
    async removeStatefulProgrammableSwitchService(accessory) {
        await this.removeService(accessory, 'StatefulProgrammableSwitch', 'statefulProgrammableSwitch');
    }
    async removeSwitchService(accessory) {
        await this.removeService(accessory, 'Switch', 'switch');
    }
    async getBotConfigSettings(device) {
        // Bot Device Type
        this.botDeviceType = device.type ?? 'Outlet';
        const botDeviceType = device.type ? 'Device Config' : 'Default';
        this.debugWarnLog(`Use ${botDeviceType} Device Type: ${this.botDeviceType}`);
        // Bot Mode
        this.botMode = device.mode ?? 'switch';
        if (!device.mode) {
            this.botMode = 'switch';
            this.warnLog(`${this.device.deviceType}: ${this.accessory.displayName} does not have bot mode set in the Plugin's SwitchBot Device Settings, defaulting to "${this.botMode}" mode. You may experience issues.`);
        }
        else if (['switch', 'press', 'multipress'].includes(device.mode)) {
            this.botMode = device.mode;
            this.debugLog(`${this.device.deviceType}: ${this.accessory.displayName} Using Bot Mode: ${this.botMode}`);
        }
        else {
            throw new Error(`${this.device.deviceType}: ${this.accessory.displayName} Invalid Bot Mode: ${device.mode}`);
        }
        const botModeLog = device.mode
            ? `Using Bot Mode: ${this.botMode}`
            : `No Bot Mode Set, Using default Bot Mode: ${this.botMode}`;
        this.debugWarnLog(botModeLog);
        this.accessory.context.botMode = this.botMode;
        // Bot Double Press
        this.doublePress = device.doublePress ?? 1;
        const doublePress = device.doublePress
            ? `Using Double Press: ${this.doublePress}`
            : `No Double Press Set, Using default Double Press: ${this.doublePress}`;
        this.debugWarnLog(doublePress);
        // Bot Press PushRate
        this.pushRatePress = device.pushRatePress ?? 15;
        const pushRatePress = device.pushRatePress
            ? `Using Bot Push Rate Press: ${this.pushRatePress}`
            : `No Push Rate Press Set, Using default Push Rate Press: ${this.pushRatePress}`;
        this.debugWarnLog(pushRatePress);
        // Bot Allow Push
        this.allowPush = device.allowPush ?? false;
        const allowPush = device.allowPush
            ? `Using Allow Push: ${this.allowPush}`
            : `No Allow Push Set, Using default Allow Push: ${this.allowPush}`;
        this.debugWarnLog(allowPush);
        // Bot Multi Press Count
        this.multiPressCount = 0;
        this.debugWarnLog(`Multi Press Count: ${this.multiPressCount}`);
    }
    async BLEPushConnection() {
        if (this.platform.config.credentials?.token && this.device.connectionType === 'BLE/OpenAPI') {
            this.warnLog('Using OpenAPI Connection to Push Changes');
            await this.openAPIpushChanges();
        }
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
            const updateCharacteristics = (service, characteristics) => {
                for (const [characteristic, value] of Object.entries(characteristics)) {
                    service.updateCharacteristic(this.hap.Characteristic[characteristic], value);
                }
            };
            const characteristicsMap = {
                garagedoor: { TargetDoorState: 'CLOSED', CurrentDoorState: 'CLOSED', ObstructionDetected: false },
                door: { TargetPosition: 0, CurrentPosition: 0, PositionState: 'STOPPED' },
                window: { TargetPosition: 0, CurrentPosition: 0, PositionState: 'STOPPED' },
                windowcovering: { TargetPosition: 0, CurrentPosition: 0, PositionState: 'STOPPED' },
                lock: { LockTargetState: 'SECURED', LockCurrentState: 'SECURED' },
                faucet: { Active: 'INACTIVE' },
                fan: { On: false },
                stateful: { ProgrammableSwitchEvent: 'SINGLE_PRESS', ProgrammableSwitchOutputState: 0 },
                switch: { On: false },
                outlet: { On: false },
            };
            const service = this[this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1)]?.Service;
            if (service) {
                updateCharacteristics(service, characteristicsMap[this.botDeviceType]);
            }
        }
    }
    async apiError(e) {
        const updateCharacteristics = (service, characteristics) => {
            for (const [characteristic] of Object.entries(characteristics)) {
                service.updateCharacteristic(this.hap.Characteristic[characteristic], e);
            }
        };
        const characteristicsMap = {
            garagedoor: { TargetDoorState: e, CurrentDoorState: e, ObstructionDetected: e },
            door: { TargetPosition: e, CurrentPosition: e, PositionState: e },
            window: { TargetPosition: e, CurrentPosition: e, PositionState: e },
            windowcovering: { TargetPosition: e, CurrentPosition: e, PositionState: e },
            lock: { LockTargetState: e, LockCurrentState: e },
            faucet: { Active: e },
            fan: { On: e },
            stateful: { ProgrammableSwitchEvent: e, ProgrammableSwitchOutputState: e },
            switch: { On: e },
            outlet: { On: e },
        };
        this.Battery.Service.updateCharacteristic(this.hap.Characteristic.BatteryLevel, e);
        this.Battery.Service.updateCharacteristic(this.hap.Characteristic.StatusLowBattery, e);
        const service = this[this.botDeviceType.charAt(0).toUpperCase() + this.botDeviceType.slice(1)]?.Service;
        if (service) {
            updateCharacteristics(service, characteristicsMap[this.botDeviceType]);
        }
    }
}
//# sourceMappingURL=bot.js.map