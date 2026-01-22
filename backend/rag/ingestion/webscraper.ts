import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
// @ts-ignore
import UserAgent from 'user-agents';

export async function scrapeSources(sources: any[]): Promise<{ title: string, url: string, text: string }[]> {
  const outputDir = './scraped';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const results = [];
  for (const source of sources) {
    try {
      const userAgent = new UserAgent().toString(); // Rotate User-Agent
      const res = await axios.get(source.url, {
        timeout: 15000, // Increased timeout
        headers: {
          'User-Agent': userAgent
        }
      });
      const $ = cheerio.load(res.data);
      const text = $('p').map((i, el) => $(el).text()).get().join('\n\n');
      const filename = source.id || source.title.replace(/\W+/g, '_').slice(0, 40);
      fs.writeFileSync(path.join(outputDir, `${filename}.txt`), text);
      results.push({ title: source.title, url: source.url, text });
      console.log(`Scraped: ${source.title}`);
    } catch (err: any) {
      console.error(`Failed to scrape ${source.url}:`, err.message);
      if (err.response?.status === 403) {
        console.log(`Retrying ${source.url} with a different User-Agent...`);
        continue;
      }
    }
  }
  return results;
}

