import axios from 'axios'
// import puppeteer from 'puppeteer' // Uncomment if using Puppeteer

export interface Lead {
  companyName: string
  website: string
  contactPerson?: string
  linkedInUrl?: string
  email?: string
  industry?: string
  country?: string
}

export interface ScraperOptions {
  icp: {
    countries: string[]
    keywords: string[]
  }
  limit?: number
  rateLimitMs?: number
}

// Example using SerpAPI for demonstration (replace with Puppeteer logic if needed)
export async function scrapeLeads(options: ScraperOptions): Promise<Lead[]> {
  const { icp, limit = 10, rateLimitMs = 2000 } = options
  const leads: Lead[] = []
  let count = 0
  const serpApiKey = process.env.SERPAPI_KEY
  if (!serpApiKey) throw new Error('SERPAPI_KEY not set in environment')

  for (const country of icp.countries) {
    for (const keyword of icp.keywords) {
      if (count >= limit) break
      try {
        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
          keyword + ' web development company ' + country
        )}&location=${encodeURIComponent(country)}&api_key=${serpApiKey}`
        const response = await axios.get(url)
        const results = response.data?.organic_results || []
        for (const result of results) {
          if (count >= limit) break
          leads.push({
            companyName: result.title || '',
            website: result.link || '',
            contactPerson: undefined, // Not available from Google
            linkedInUrl: undefined, // Could be parsed from site_links if present
            email: undefined, // Not available from Google
            industry: 'Web/Mobile Development',
            country,
          })
          count++
        }
        await new Promise((res) => setTimeout(res, rateLimitMs))
      } catch (err) {
        console.error('Error scraping:', err)
        continue
      }
    }
  }
  return leads.slice(0, limit)
}

export function generateColdEmail(lead: Lead): string {
  return `Subject: Partnership Opportunity with ${lead.companyName}

Dear ${lead.contactPerson || 'Team'},

I came across ${lead.companyName} and was impressed by your work in ${
    lead.industry || 'the industry'
  }. We specialize in software development and believe we could add significant value to your operations.

Would you be open to a brief call next week to explore potential synergies?

Looking forward to your response.

Best regards,
Lenk Solutions`
}

export interface BANTScore {
  budget: boolean
  authority: boolean
  need: boolean
  timeline: boolean
  totalScore: number
  qualificationStatus: 'hot lead' | 'warm lead' | 'cold lead'
}

export function scoreLead(reply: string): BANTScore {
  const budget = /(funding|budget|investment)/i.test(reply)
  const authority = /(I am|we are|decision maker|authority)/i.test(reply)
  const need = /(looking for|need|require|want)/i.test(reply)
  const timeline = /(next month|next week|in [0-9]|soon|immediately)/i.test(
    reply
  )

  const totalScore = [budget, authority, need, timeline].filter(Boolean).length
  const qualificationStatus =
    totalScore === 4 ? 'hot lead' : totalScore >= 2 ? 'warm lead' : 'cold lead'

  return {
    budget,
    authority,
    need,
    timeline,
    totalScore,
    qualificationStatus,
  }
}

// Example usage:
// (async () => {
//   const leads = await scrapeLeads({
//     icp: {
//       countries: ['US', 'UK', 'Canada'],
//       keywords: ['web development', 'mobile development'],
//     },
//     limit: 10,
//   })
//   console.log(JSON.stringify(leads, null, 2))
//   const email = generateColdEmail(leads[0]);
//   console.log(email);
// })()
