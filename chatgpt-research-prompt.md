# ChatGPT: Target Company Research Prompt

Use this prompt in ChatGPT (with web search enabled) to generate your initial 
target company list and/or enrich companies you've already identified.

Run it in batches of 25-30 companies at a time for best results.
ChatGPT will return a CSV you can paste directly into your Company Tracker sheet.

---

## THE PROMPT

GOAL
Create a spreadsheet of promising target companies for my job search.
1) Research and fill in current information for any companies I've already identified (listed below).
2) Identify [25–30] additional companies that meet my filters and appear equally strong fits.
3) Output all companies in one CSV with consistent fields.

CONTEXT & FILTERS
- Funding stage: [YOUR PREFERRED FUNDING STAGE]
- Product domain: [YOUR TARGET INDUSTRIES]
- Explicitly exclude: [INDUSTRIES OR COMPANIES TYPES YOU WANT TO EXCLUDE]
- Geography / work setup: [YOUR PREFERRED CITY/CITIES OR REMOTE]
- Company size: [YOUR PREFERRED HEADCOUNT RANGE]
- Target roles: [YOUR TARGET TITLES]

WHAT TO ASSESS
For each company (existing and new):
1. Growth trajectory (headcount trend 12–18 months)
2. Hiring signal (open roles in my target titles, posted within 60 days)
3. Funding & runway (rounds, investors, recency)
4. Demand/traction proxies (customer logos, reviews, release cadence, partnerships)
5. Key challenges (competition, pricing, regulation, platform dependence)
6. Decision makers for hiring (TITLES OF PEOPLE WHO MIGHT BE YOUR MANAGER + LinkedIn or source)

OUTPUT
Return a CSV with these exact column headers:
Company Name, URL, Industry, Size / Stage, Growth Indicators, Priority for Follow Up, Notes
- Priority for Follow Up: assign High / Medium / Low based on growth signals, hiring activity, and fit with my filters
- Growth Indicators: 1-2 bullets on trajectory and hiring signals

METHOD
1) For any companies I've provided: research and fill every field; note missing data as "Unknown"
2) Find [25–30] additional companies matching my criteria
3) Deduplicate, then return all companies in one CSV
4) After the CSV, include a brief summary: top patterns observed and a "Top 10 Priority Targets" list with rationale and any open role links you found

COMPANIES I'VE ALREADY IDENTIFIED (add yours here, or leave blank if starting fresh):
[paste your list here, one per line]

BEGIN.

---

## TIPS FOR BEST RESULTS

- Run with web search enabled (the globe icon) for current hiring and funding data
- If you have more than 25 existing companies, break into batches of 25 and run separately
- After the first run, you can ask ChatGPT to find more companies in a specific sub-sector:
  "Find 15 more companies in [SECTOR] that match my filters"
- To add the results to your sheet: copy the CSV output, paste into a blank Google Sheet tab, 
  then copy just the data rows into your Company Tracker sheet
- The Priority for Follow Up column maps directly to the dropdown in your tracker sheet

## FOLLOW-UP PROMPT (for additional rounds of discovery)

I have my initial list. Now find [15–20] more companies in [specific sector] that match 
my filters and aren't already on my list. Use the same CSV format and Priority scoring.
My existing companies are: [paste current list]
