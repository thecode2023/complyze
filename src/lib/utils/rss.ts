import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Complyze-Regulatory-Intelligence/1.0",
  },
});

export interface RSSFeedItem {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate: string;
  source: string;
}

export interface RSSSource {
  name: string;
  url: string;
  category: string;
}

export const rssSources: RSSSource[] = [
  {
    name: "Federal Register — AI and Technology",
    url: "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Btopic_ids%5D%5B%5D=artificial-intelligence",
    category: "US Federal",
  },
  {
    name: "EUR-Lex — AI Act and Digital Policy",
    url: "https://eur-lex.europa.eu/EN/display-feed.html?rssId=67",
    category: "EU",
  },
  {
    name: "UK Legislation — New Legislation",
    url: "https://www.legislation.gov.uk/new/data.feed",
    category: "UK",
  },
];

export async function fetchRSSFeed(source: RSSSource): Promise<RSSFeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 10).map((item) => ({
      title: String(item.title || "Untitled"),
      link: String(item.link || ""),
      contentSnippet: String(item.contentSnippet || item.content || ""),
      pubDate: String(item.pubDate || new Date().toISOString()),
      source: source.name,
    }));
  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllRSSFeeds(): Promise<RSSFeedItem[]> {
  const results = await Promise.allSettled(
    rssSources.map((source) => fetchRSSFeed(source))
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
}
