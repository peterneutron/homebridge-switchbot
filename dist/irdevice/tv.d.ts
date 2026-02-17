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
export declare class TV extends irdeviceBase {
    readonly platform: SwitchBotPlatform;
    private Television;
    private TelevisionSpeaker;
    constructor(platform: SwitchBotPlatform, accessory: PlatformAccessory, device: irdevice & irDevicesConfig);
    VolumeSelectorSet(value: CharacteristicValue): Promise<void>;
    RemoteKeySet(value: CharacteristicValue): Promise<void>;
    ActiveIdentifierSet(value: CharacteristicValue): Promise<void>;
    ActiveSet(value: CharacteristicValue): Promise<void>;
    /**
     * Pushes the requested changes to the SwitchBot API
     * deviceType    commandType     Command           Parameter          Description
     * TV           "command"       "turnOff"         "default"          set to OFF state
     * TV           "command"       "turnOn"          "default"          set to ON state
     * TV           "command"       "volumeAdd"       "default"          volume up
     * TV           "command"       "volumeSub"       "default"          volume down
     * TV           "command"       "channelAdd"      "default"          next channel
     * TV           "command"       "channelSub"      "default"          previous channel
     */
    pushTvOnChanges(): Promise<void>;
    pushTvOffChanges(): Promise<void>;
    pushOkChanges(): Promise<void>;
    pushBackChanges(): Promise<void>;
    pushMenuChanges(): Promise<void>;
    pushUpChanges(): Promise<void>;
    pushDownChanges(): Promise<void>;
    pushRightChanges(): Promise<void>;
    pushLeftChanges(): Promise<void>;
    pushVolumeUpChanges(): Promise<void>;
    pushVolumeDownChanges(): Promise<void>;
    pushTVChanges(bodyChange: any): Promise<void>;
    updateHomeKitCharacteristics(): Promise<void>;
    apiError(e: any): Promise<void>;
}
//# sourceMappingURL=tv.d.ts.map