import { parse } from 'csv-parse/sync';
import Config from '../../config/config.json' with { type: "json" };
import { HttpService, Logger } from '../services/index.js';

export interface Song {
    title: string;
    artist: string;
    searchable: {
        title: string;
        artist: string;
    };
}

export class Content {
    private static artists: Set<string>;
    private static songs: Song[];

    constructor(
    ) {
        Content.artists = new Set();
        Content.songs = [];
    }

    public static getSongs(): Song[] {
        return Content.songs;
    }

    public static getArtists(): Set<string> {
        return Content.artists;
    }

    public static setSongs(songs: Song[]): void {
        Content.artists = new Set(songs.map((song) => song.artist));
        Content.songs = songs;
    }

    public static titleSearchSongs(search: string): Song[] {
        const normalSearch = this.normalizeSearch(search);
        return Content.songs.filter((song) => song.searchable.title.includes(normalSearch));
    }

    public static artistSearchSongs(search: string): Song[] {
        const normalSearch = this.normalizeSearch(search);
        return Content.songs.filter((song) => song.searchable.artist.includes(normalSearch));
    }

    public static allSearchSongs(search: string): Song[] {
        const normalSearch = this.normalizeSearch(search);
        const songs = Content.songs.filter((song) => song.searchable.title.includes(normalSearch) 
        || song.searchable.artist.includes(normalSearch));
        
        return songs;
    }

    public static normalizeSearch(search: string): string {
        return search.toLowerCase().replace("'", '');
    }

    public static async updateSongs(): Promise<void> {
        let songs: Song[] = [];
        try {
            let res = await new HttpService().getCsv(Config.search.sheet);

            if (!res.ok) {
                throw res;
            }

            let text = await res.text();

            Logger.info(`Text: ${text}`);

            const records: [string, string][] = parse(text, { trim: true, skip_empty_lines: true });

            for (let record of records) {
                let [title, artist] = record;
                songs.push({ title, artist, searchable: { title: this.normalizeSearch(title), artist: this.normalizeSearch(artist) }});
            }

            // remove header
            songs.shift();

            // Sort songs by artist
            songs.sort((a, b) => a.artist.localeCompare(b.artist));

            this.setSongs(songs);

            Logger.info(`Updated songs: ${songs.length}`);
        } catch (error) {
            throw error;
        }
    }
}