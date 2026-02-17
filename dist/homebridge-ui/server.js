import fs from 'node:fs';
import { HomebridgePluginUiServer } from '@homebridge/plugin-ui-utils';
class PluginUiServer extends HomebridgePluginUiServer {
    constructor() {
        super();
        /*
          A native method getCachedAccessories() was introduced in config-ui-x v4.37.0
          The following is for users who have a lower version of config-ui-x
        */
        this.onRequest('getCachedAccessories', () => {
            try {
                const plugin = 'homebridge-switchbot';
                const devicesToReturn = [];
                // The path and file of the cached accessories
                const accFile = `${this.homebridgeStoragePath}/accessories/cachedAccessories`;
                // Check the file exists
                if (fs.existsSync(accFile)) {
                    // read the cached accessories file
                    const cachedAccessories = JSON.parse(fs.readFileSync(accFile, 'utf8'));
                    cachedAccessories.forEach((accessory) => {
                        // Check the accessory is from this plugin
                        if (accessory.plugin === plugin) {
                            // Add the cached accessory to the array
                            devicesToReturn.push(accessory.accessory);
                        }
                    });
                }
                // Return the array
                return devicesToReturn;
            }
            catch {
                // Just return an empty accessory list in case of any errors
                return [];
            }
        });
        this.ready();
    }
}
function startPluginUiServer() {
    return new PluginUiServer();
}
startPluginUiServer();
//# sourceMappingURL=server.js.map