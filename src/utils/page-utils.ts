import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, CommandInteraction, ComponentType, EmbedBuilder, Interaction, InteractionCollector, MessageCollectorOptionsParams, User } from "discord.js";

export class PageUtils {
    private pages: { [key: string]: number };
    private embeds: EmbedBuilder[];
    private intr: CommandInteraction;
    private collectorOps: MessageCollectorOptionsParams<ComponentType.Button, boolean>;
    private time: number;
    private user: User;

    constructor(
        embeds: EmbedBuilder[],
        intr: CommandInteraction,
        time: number = 1000 * 60 * 5 // 5 minutes
    ) {
        this.pages = {};
        this.embeds = embeds;
        this.intr = intr;
        this.time = time;
        this.user = this.intr.user;
        this.pages[this.user.id] = this.pages[this.user.id] || 0;
        this.intr.editReply({
            embeds: [this.embeds[this.pages[this.user.id]]],
            components: [this.getRow(this.user.id)],
        });
        this.collectorOps = {
            filter: (i: ButtonInteraction ) => {
                return i.user.id === this.user.id
            },
            componentType: ComponentType.Button,
            time: this.time,
        };

        this.intr.fetchReply().then((message) => {
            message.createMessageComponentCollector<ComponentType.Button>(this.collectorOps)
                .on('collect', (i: ButtonInteraction<CacheType>) => this.handleInteraction(i));
        });
    }

    private getRow(id: string) {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setEmoji('⏮️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(this.pages[id] === 0),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setEmoji('⏭️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(this.pages[id] === this.embeds.length - 1)
            );
        return row;
    }

    private async handleInteraction(interaction: ButtonInteraction<CacheType>) {
        if (!interaction) {
            return;
        }

        await interaction.deferUpdate();
        const customId = interaction.customId;

        if (customId !== 'prev_page' && customId !== 'next_page') {
            return;
        }

        if (customId === 'prev_page' && this.pages[interaction.user.id] > 0) {
            --this.pages[interaction.user.id];
        } else if (customId === 'next_page' && this.pages[interaction.user.id] < this.embeds.length - 1) {
            ++this.pages[interaction.user.id];
        }

        await interaction.editReply({
            embeds: [this.embeds[this.pages[interaction.user.id]]],
            components: [this.getRow(interaction.user.id)],
        });
    }
}