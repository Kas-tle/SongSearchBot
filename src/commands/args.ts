import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';

import { DevCommandName, HelpOption, InfoOption } from '../enums/index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export class Args {
    public static readonly DEV_COMMAND: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.command', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.command'),
        description: Lang.getRef('argDescs.devCommand', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.devCommand'),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('devCommandNames.info', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('devCommandNames.info'),
                value: DevCommandName.INFO,
            },
        ],
    };
    public static readonly SEARCH_QUERY: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.query', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.query'),
        description: Lang.getRef('argDescs.searchQuery', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.searchQuery'),
        type: ApplicationCommandOptionType.String,
        required: true,
    }
    public static readonly SEARCH_TYPE: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.type', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.type'),
        description: Lang.getRef('argDescs.searchType', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.searchType'),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('searchTypes.title', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('searchTypes.title'),
                value: 'title',
            },
            {
                name: Lang.getRef('searchTypes.artist', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('searchTypes.artist'),
                value: 'artist',
            },
            {
                name: Lang.getRef('searchTypes.all', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('searchTypes.all'),
                value: 'all',
            },
        ],
        required: false
    };
}
