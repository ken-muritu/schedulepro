const CACHE_PREFIX = 'schedulepro_daily_';

const BIBLE_VERSES = [
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { ref: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { ref: 'Matthew 6:33', text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
  { ref: 'Psalm 46:1', text: 'God is our refuge and strength, an ever-present help in trouble.' },
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Romans 12:2', text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.' },
  { ref: 'Psalm 37:4', text: 'Take delight in the Lord, and he will give you the desires of your heart.' },
  { ref: 'Proverbs 16:3', text: 'Commit to the Lord whatever you do, and he will establish your plans.' },
  { ref: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.' },
  { ref: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light on my path.' },
  { ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { ref: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.' },
  { ref: 'Ephesians 2:8-9', text: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.' },
  { ref: 'Psalm 27:1', text: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?' },
  { ref: '2 Timothy 1:7', text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.' },
  { ref: 'Proverbs 31:25', text: 'She is clothed with strength and dignity; she can laugh at the days to come.' },
  { ref: 'John 14:6', text: 'Jesus answered, I am the way and the truth and the life. No one comes to the Father except through me.' },
  { ref: 'Psalm 139:14', text: 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.' },
  { ref: 'Romans 5:8', text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.' },
  { ref: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
  { ref: 'Lamentations 3:22-23', text: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.' },
  { ref: '1 Corinthians 13:4-5', text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking.' },
  { ref: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
  { ref: 'James 1:2-3', text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.' },
  { ref: 'Psalm 91:1-2', text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress, my God, in whom I trust.' },
  { ref: 'Matthew 5:14', text: 'You are the light of the world. A town built on a hill cannot be hidden.' },
  { ref: 'John 16:33', text: 'I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.' },
  { ref: 'Proverbs 4:23', text: 'Above all else, guard your heart, for everything you do flows from it.' },
  { ref: 'Isaiah 43:2', text: 'When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you.' },
  { ref: 'Psalm 34:18', text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.' },
  { ref: 'Romans 8:37', text: 'No, in all these things we are more than conquerors through him who loved us.' },
  { ref: 'Ephesians 3:20', text: 'Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us.' },
  { ref: 'Psalm 16:8', text: 'I keep my eyes always on the Lord. With him at my right hand, I will not be shaken.' },
  { ref: '1 Peter 5:7', text: 'Cast all your anxiety on him because he cares for you.' },
  { ref: 'Colossians 3:23', text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
  { ref: 'Micah 6:8', text: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.' },
  { ref: 'Psalm 23:4', text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
  { ref: 'John 10:10', text: 'The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full.' },
  { ref: 'Deuteronomy 31:6', text: 'Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.' },
  { ref: '2 Corinthians 5:17', text: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!' },
  { ref: 'Psalm 121:1-2', text: 'I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth.' },
  { ref: 'Matthew 28:20', text: 'And surely I am with you always, to the very end of the age.' },
  { ref: 'Proverbs 18:10', text: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.' },
  { ref: 'Isaiah 26:3', text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.' },
  { ref: 'Psalm 46:10', text: 'He says, Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.' },
  { ref: 'Revelation 21:4', text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.' },
  { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
];

const FALLBACK_CONTENT = {
  quote: 'Discipline is the bridge between goals and accomplishment.',
  quoteAuthor: 'Jim Rohn',
  fact: 'The average person spends about 6 months of their lifetime waiting at red lights.',
  scripture: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
  scriptureRef: 'Jeremiah 29:11',
  backgroundUrl: null,
  fetchedAt: new Date()?.toISOString(),
};

function getDateKey(date = new Date()) {
  const y = date?.getFullYear();
  const m = String(date?.getMonth() + 1)?.padStart(2, '0');
  const d = String(date?.getDate())?.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateSeed(date = new Date()) {
  const y = date?.getFullYear();
  const m = String(date?.getMonth() + 1)?.padStart(2, '0');
  const d = String(date?.getDate())?.padStart(2, '0');
  return `${y}${m}${d}`;
}

function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getScriptureForToday() {
  const dayOfYear = getDayOfYear();
  const index = Math.floor(dayOfYear / 7) % BIBLE_VERSES?.length;
  return BIBLE_VERSES?.[index];
}

function getCachedContent(dateKey) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${dateKey}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore parse errors
  }
  return null;
}

function setCachedContent(dateKey, content) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${dateKey}`, JSON.stringify(content));
  } catch (e) {
    // ignore storage errors
  }
}

// Remove all cached entries that are NOT today's date key
function purgeStaleDailyCache(todayKey) {
  try {
    const keys = Object.keys(localStorage)?.filter((k) => k?.startsWith(CACHE_PREFIX));
    keys?.forEach((k) => {
      if (k !== `${CACHE_PREFIX}${todayKey}`) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {
    // ignore
  }
}

function getMostRecentCachedContent() {
  try {
    const keys = Object.keys(localStorage)?.filter((k) => k?.startsWith(CACHE_PREFIX))?.sort()?.reverse();
    if (keys?.length > 0) {
      const raw = localStorage.getItem(keys?.[0]);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function fetchQuote() {
  const res = await fetch('https://api.quotable.io/quotes/random?tags=inspirational');
  if (!res?.ok) throw new Error('Quote fetch failed');
  const data = await res?.json();
  const item = Array.isArray(data) ? data?.[0] : data?.results?.[0] ?? data;
  return { quote: item?.content, quoteAuthor: item?.author };
}

async function fetchFact() {
  const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/today?language=en');
  if (!res?.ok) throw new Error('Fact fetch failed');
  const data = await res?.json();
  return { fact: data?.text };
}

export async function getDailyContent() {
  const todayKey = getDateKey();

  // Purge any stale (non-today) caches so old content never bleeds through
  purgeStaleDailyCache(todayKey);

  // 1. Try today's cache first
  const cached = getCachedContent(todayKey);
  if (cached) return cached;

  // 2. Try to fetch fresh content
  const scripture = getScriptureForToday();
  const seed = getDateSeed();
  const backgroundUrl = `https://picsum.photos/seed/${seed}/1920/1080`;

  const [quoteResult, factResult] = await Promise.allSettled([
    fetchQuote(),
    fetchFact(),
  ]);

  const quoteData = quoteResult?.status === 'fulfilled'
    ? quoteResult?.value
    : { quote: FALLBACK_CONTENT?.quote, quoteAuthor: FALLBACK_CONTENT?.quoteAuthor };

  const factData = factResult?.status === 'fulfilled'
    ? factResult?.value
    : { fact: FALLBACK_CONTENT?.fact };

  const content = {
    quote: quoteData?.quote,
    quoteAuthor: quoteData?.quoteAuthor,
    fact: factData?.fact,
    scripture: scripture?.text,
    scriptureRef: scripture?.ref,
    backgroundUrl,
    fetchedAt: new Date()?.toISOString(),
  };

  setCachedContent(todayKey, content);
  return content;
}

export function getFallbackContent() {
  // Try most recent cache, then built-in fallback
  const recent = getMostRecentCachedContent();
  return recent || FALLBACK_CONTENT;
}

// Force clear today's cache so next getDailyContent() call fetches fresh data
export function clearTodayCache() {
  try {
    const todayKey = getDateKey();
    localStorage.removeItem(`${CACHE_PREFIX}${todayKey}`);
  } catch (e) {
    // ignore
  }
}
