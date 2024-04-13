import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { SearchType } from '../../enums/search-type.js';
import { Content, Song } from '../../models/content.js';
import { PageUtils } from '../../utils/page-utils.js';

export class SearchCommand implements Command {
    public names = [Lang.getRef('chatCommands.search', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            query: intr.options.getString(Lang.getRef('arguments.query', data.lang)),
            type: intr.options.getString(Lang.getRef('arguments.type', data.lang)) as 'title' | 'artist' | 'all' | undefined,
        };

        Logger.info(`Searching for ${args.query} by ${args.type}...`);
        let searchType = '';

        const embeds: EmbedBuilder[] = [];
        let matches: Song[];

        switch (args.type) {
            case 'title': {
                matches = Content.titleSearchSongs(args.query);
                searchType = 'title';
                break;
            }
            case 'artist': {
                matches = Content.artistSearchSongs(args.query);
                searchType = 'artist';
                break;
            }
            case 'all': {
                matches = Content.allSearchSongs(args.query);
                searchType = 'all';
                break;
            }
            default: {
                matches = Content.allSearchSongs(args.query);
                searchType = 'all';
                break;
            }
        }

        if (matches.length === 0) {
            embeds[0] = Lang.getEmbed('displayEmbeds.noResults', data.lang);
            await InteractionUtils.send(intr, embeds[0]);
        } else {
            let embedIndex = 0;
            embeds[embedIndex] = Lang.getEmbed('displayEmbeds.searchResults', data.lang);
            // Group matches by artist
            const results: Map<string, string[]> = new Map();

            for (let song of matches) {
                if (!results.has(song.artist)) {
                    results.set(song.artist, []);
                }
                results.get(song.artist).push(song.title);
            }

            // Add fields to embed
            let fieldsAdded = 0;
            let linesAdded = 0;
            const MAX_LINES = 30;
            const MAX_FIELDS = 25;
            for (let [artist, titles] of results) {
                if (fieldsAdded >= MAX_FIELDS || linesAdded >= MAX_LINES) {
                    ++embedIndex;
                    fieldsAdded = 0;
                    linesAdded = 0;
                }

                linesAdded += 1;
                let value = '';

                for (let title of titles) {
                    if (linesAdded >= MAX_LINES && value.length > 0) {
                        if (!embeds[embedIndex]) {
                            embeds[embedIndex] = Lang.getEmbed('displayEmbeds.searchResults', data.lang);
                        }
                        embeds[embedIndex].addFields([{ name: artist, value }]);
                        ++embedIndex;
                        fieldsAdded = 0;
                        value = '';
                        linesAdded = 0;
                    }
                    value += `- ${title}\n`;
                    ++linesAdded;
                }

                if (!embeds[embedIndex]) {
                    embeds[embedIndex] = Lang.getEmbed('displayEmbeds.searchResults', data.lang);
                }

                embeds[embedIndex].addFields([{ name: artist, value }]);
                ++fieldsAdded;
            }

            if (embeds.length > 1) {
                for (let i = 0; i < embeds.length; i++) {
                    embeds[i].setFooter({
                        text: `(${i + 1}/${embeds.length}) • query=${args.query} • type=${searchType} • songs=${matches.length} • artists=${results.size}`,
                    });
                }
                new PageUtils(embeds, intr);
            } else {
                embeds[0].setFooter({
                    text: `(1/1) query=${args.query} • type=${searchType} • songs=${matches.length} • artists=${results.size}`,
                });
                await InteractionUtils.send(intr, embeds[0]);
            }
        }
    }
}
