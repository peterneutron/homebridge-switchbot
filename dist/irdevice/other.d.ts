import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import type { irdevice } from 'node-switchbot';
import type { SwitchBotPlatform } from '../platform.js';
import type { irDevicesConfig } from '../settings.js';
import { irdeviceBase } from './irdevice.js';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Others extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
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
    otherDeviceType?: string;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    /**
     * Handle requests to set the "On" characteristic
     */
    OnSet(value: CharacteristicValue): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType    commandType     Command           command parameter           Description
     * Other -       "command"       "turnOff"         "default"          =        set to OFF state
     * Other -       "command"       "turnOn"          "default"          =        set to ON state
     * Other -       "command"       "volumeAdd"       "default"          =        volume up
     * Other -       "command"       "volumeSub"       "default"          =        volume down
     * Other -       "command"       "channelAdd"      "default"          =        next channel
     * Other -       "command"       "channelSub"      "default"          =        previous channel
     */
    pushOnChanges(On: boolean): Promise<void>;
    pushOffChanges(On: boolean): Promise<void>;
    pushChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
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
    getOtherConfigSettings(accessory: PlatformAccessory, device: irdevice & irDevicesConfig): Promise<void>;
}
//# sourceMappingURL=other.d.ts.map