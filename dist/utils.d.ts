import type { blindTilt, curtain, curtain3, device } from 'node-switchbot';
import { Buffer } from 'node:buffer';
import type { devicesConfig } from './settings.js';
export declare enum BlindTiltMappingMode {
    OnlyUp = "only_up",
    OnlyDown = "only_down",
    DownAndUp = "down_and_up",
    UpAndDown = "up_and_down",
    UseTiltForDirection = "use_tilt_for_direction"
}
export declare function isCurtainDevice(device: device & devicesConfig): device is (curtain | curtain3) & devicesConfig;
export declare function isBlindTiltDevice(device: device & devicesConfig): device is blindTilt & devicesConfig;
export declare function sleep(ms: number): Promise<void>;
/**
 * Check if the humidity is within the min and max range
 * @param humidity - The humidity value
 * @param min - The minimum humidity value
 * @param max - The maximum humidity value
 * @returns The humidity value
 */
export declare function validHumidity(humidity: number, min?: number, max?: number): number;
/**
 * Converts the value to celsius if the temperature units are in Fahrenheit
 */
export declare function convertUnits(value: number, unit: string, convert?: string): number;
/**
 * Safely serializes an object to a JSON string, handling circular references.
 *
 * @param obj - The object to be serialized.
 * @returns The JSON string representation of the object.
 */
export declare function safeStringify(obj: any): string;
/**
 * Formats a device ID as a MAC address.
 * Ensures the device ID does not already contain colons.
 *
 * @param deviceId - The device ID to format.
 * @param cassSensative - If the MAC address should be case sensitive. Default is false, which will return the MAC address in lowercase.
 * @returns The formatted MAC address.
 * @throws Will throw an error if the device ID is not a valid MAC address or a 12-character hexadecimal string.
 */
export declare function formatDeviceIdAsMac(deviceId: string, cassSensative?: boolean): string;
declare const BOT_BLE_ACTION_VALUES: readonly [0, 1, 2];
type BotBleAction = (typeof BOT_BLE_ACTION_VALUES)[number];
export declare function validateBotPassword(password: string): void;
export declare function buildBotBleCommand(action: BotBleAction, password?: string): Buffer;
export declare function rgb2hs(r: any, g: any, b: any): number[];
export declare function hs2rgb(h: any, s: any): number[];
export declare function k2rgb(k: number): any;
export declare function m2hs(m: any): number[];
export {};
//# sourceMappingURL=utils.d.ts.map