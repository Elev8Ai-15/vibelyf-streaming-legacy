/**
 * VIBELYF BUILD ENGINE - STAGE 1: GENIUS LYRICS SCANNER
 * Fetches trending song lyrics from Genius API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

class GeniusScanner {
    constructor() {
        this.apiKey = config.apis.genius.apiKey;
        this.baseUrl = config.apis.genius.baseUrl;
        this.scanHistory = [];
        this.lyricsCache = {};
    }

    /**
     * Main function: Scan trending songs for lyrics
     */
    async scanTrendingSongs(genres = config.scanning.genres, limit = config.scanning.totalSongsPerScan) {
        console.log(chalk.blue(`\n🎵 STAGE 1: LYRICS SCANNER`));
        console.log(chalk.gray(`Scanning ${limit} songs across genres: ${genres.join(', ')}`));

        const results = [];
        const songsPerGenre = Math.ceil(limit / genres.length);

        for (const genre of genres) {
            try {
                console.log(chalk.cyan(`\n📊 Searching ${genre} songs...`));
                const songs = await this.searchSongsByGenre(genre, songsPerGenre);
                
                for (const song of songs) {
                    try {
                        const lyrics = await this.getLyricsFromGenius(song.url);
                        
                        if (lyrics && lyrics.length >= config.scanning.minLyricsLength) {
                            results.push({
                                title: song.title,
                                artist: song.artist,
                                genre: genre,
                                lyrics: lyrics,
                                url: song.url,
                                scrapedDate: new Date().toISOString(),
                                source: 'genius'
                            });
                            console.log(chalk.green(`  ✓ ${song.artist} - ${song.title}`));
                        }
                    } catch (error) {
                        console.log(chalk.yellow(`  ⚠ Failed: ${song.title} - ${error.message}`));
                    }
                    
                    // Rate limiting
                    await this.delay(config.rateLimits.delayBetweenRequests);
                }
            } catch (error) {
                console.error(chalk.red(`  ✗ Error scanning ${genre}: ${error.message}`));
            }
        }

        await this.saveScanResults(results);
        
        console.log(chalk.green(`\n✅ Scan complete: ${results.length} songs with lyrics found`));
        return results;
    }

    /**
     * Search Genius for songs by genre/keyword
     */
    async searchSongsByGenre(genre, limit = 10) {
        const searchQuery = this.getGenreSearchQuery(genre);
        
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                params: {
                    q: searchQuery
                },
                timeout: config.apis.genius.timeout
            });

            const hits = response.data.response.hits.slice(0, limit);
            
            return hits.map(hit => ({
                title: hit.result.title,
                artist: hit.result.primary_artist.name,
                url: hit.result.url,
                id: hit.result.id
            }));
        } catch (error) {
            throw new Error(`Genius API search failed: ${error.message}`);
        }
    }

    /**
     * Get genre-specific search query
     */
    getGenreSearchQuery(genre) {
        const queries = {
            'hip-hop': 'hip hop rap trending',
            'rap': 'rap new music',
            'reggaeton': 'reggaeton latino',
            'latin': 'latin music spanish',
            'k-pop': 'kpop korean',
            'r&b': 'r&b rnb'
        };
        return queries[genre] || genre;
    }

    /**
     * Scrape lyrics from Genius song page
     */
    async getLyricsFromGenius(songUrl) {
        try {
            // Check cache first
            if (this.lyricsCache[songUrl]) {
                return this.lyricsCache[songUrl];
            }

            const response = await axios.get(songUrl, {
                timeout: config.apis.genius.timeout
            });

            const $ = cheerio.load(response.data);
            
            // Genius uses data-lyrics-container attribute
            let lyrics = '';
            $('[data-lyrics-container="true"]').each((i, elem) => {
                lyrics += $(elem).text() + '\n';
            });

            // Clean lyrics
            lyrics = this.cleanLyrics(lyrics);

            // Cache result
            this.lyricsCache[songUrl] = lyrics;

            return lyrics;
        } catch (error) {
            throw new Error(`Failed to scrape lyrics: ${error.message}`);
        }
    }

    /**
     * Clean and format lyrics text
     */
    cleanLyrics(text) {
        return text
            .replace(/\[.*?\]/g, '') // Remove [Verse], [Chorus], etc.
            .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
            .trim();
    }

    /**
     * Save scan results to JSON file
     */
    async saveScanResults(results) {
        const scanData = {
            scanDate: new Date().toISOString(),
            totalSongs: results.length,
            genres: [...new Set(results.map(r => r.genre))],
            results: results
        };

        const filePath = path.join(__dirname, '..', config.paths.scanResults);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeJSON(filePath, scanData, { spaces: 2 });
        
        console.log(chalk.gray(`  📁 Scan results saved to ${filePath}`));
    }

    /**
     * Delay utility for rate limiting
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Load previous scan results
     */
    async loadScanResults() {
        try {
            const filePath = path.join(__dirname, '..', config.paths.scanResults);
            return await fs.readJSON(filePath);
        } catch (error) {
            return null;
        }
    }
}

module.exports = GeniusScanner;
