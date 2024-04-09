import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { SearchType } from '../../enums/search-type.js';
import { Content, Song } from '../../models/content.js';

export class SearchCommand implements Command {
    public names = [Lang.getRef('chatCommands.search', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            query: intr.options.getString(Lang.getRef('arguments.query', data.lang)),
            type: intr.options.getString(Lang.getRef('arguments.type', data.lang)) as SearchType,
        };

        Logger.info(`Searching for ${args.query} by ${args.type}...`);

        let embed: EmbedBuilder;
        let matches: Song[];

        switch (args.type) {
            case SearchType.TITLE: {
                matches = Content.titleSearchSongs(args.query);
                break;
            }
            case SearchType.ARTIST: {
                matches = Content.artistSearchSongs(args.query);
                break;
            }
            case SearchType.ALL: {
                matches = Content.allSearchSongs(args.query);
                break;
            }
            default: {
                matches = Content.allSearchSongs(args.query);
                break;
            }
        }

        if (matches.length === 0) {
            embed = Lang.getEmbed('displayEmbeds.noResults', data.lang);
        } else {
            embed = Lang.getEmbed('displayEmbeds.searchResults', data.lang);
            for (let song of matches) {
                embed.addFields([
                    {
                        name: song.title,
                        value: song.artist,
                    },
                ]);
            }
        }
        
        await InteractionUtils.send(intr, embed);
    }
}
