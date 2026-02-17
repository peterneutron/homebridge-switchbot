import { SwitchBotPlatform } from './platform.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
// Register our platform with homebridge.
export default (api) => {
    api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, SwitchBotPlatform);
};
//# sourceMappingURL=index.js.map