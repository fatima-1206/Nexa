import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
// @ts-ignore
import UserAgent from 'user-agents';

export async function scrapeSources(sources: any[], outputDir?: string): Promise<{ title: string, url: string, text: string }[]> {
  const dir = outputDir || './scraped';
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const results = [];
  for (const source of sources) {
    try {
      const userAgent = new UserAgent().toString(); // Rotate User-Agent
      const res = await axios.get(source.url, {
        timeout: 15000,
        headers: {
          'User-Agent': userAgent
        }
      });
      const $ = cheerio.load(res.data);
      const text = $('p').map((i, el) => $(el).text()).get().join('\n\n');
      
      // Sanitize filename
      const sanitizedId = (source.id || source.title).replace(/[^a-z0-9]/gi, '_').slice(0, 50);
      const filename = `${sanitizedId}.txt`;
      
      fs.writeFileSync(path.join(dir, filename), text);
      results.push({ title: source.title, url: source.url, text });
      console.log(`Scraped: ${source.title}`);
    } catch (err: any) {
      console.error(`Failed to scrape ${source.url}:`, err.message);
    }
  }
  return results;
}