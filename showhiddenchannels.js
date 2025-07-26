const { WebpackModules, DiscordModules } = BdApi;

class ShowHiddenChannels {
    start() {
        this.patchChannels();
    }

    stop() {
        BdApi.Patcher.unpatchAll("ShowHiddenChannels");
    }

    patchChannels() {
        const ChannelStore = WebpackModules.getByProps("getChannels");
        BdApi.Patcher.after("ShowHiddenChannels", ChannelStore, "getChannels", (thisObject, [guildId], returnValue) => {
            const channels = returnValue;
            for (const [channelId, channel] of Object.entries(channels)) {
                if (!channel.permissions || !this.hasAccess(channel.permissions)) {
                    channel.isHidden = true;
                    channel.name = `[HIDDEN] ${channel.name || "Unknown Channel"}`;
                }
            }
            return returnValue;
        });
    }

    hasAccess(permissions) {
        const perms = new DiscordModules.Permissions(permissions);
        return perms.has("VIEW_CHANNEL");
    }
}

module.exports = class {
    getName() { return "ShowHiddenChannels"; }
    getAuthor() { return "realalexdev"; }
    getVersion() { return "1.0.0"; }
    getDescription() { return "Displays hidden channel names."; }
    start() { new ShowHiddenChannels().start(); }
    stop() { new ShowHiddenChannels().stop(); }
};