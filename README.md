# On the Radar
### Company intelligence for job seekers

A lightweight system I built to take the manual grind out of company research during my job search. It combines a Chrome extension, Google Sheets, ChatGPT, and Perplexity into a three-stage workflow: capture companies as you find them, research and prioritize them on a cadence, and passively monitor for signals worth acting on.

I'm a senior product leader who has always been technically fluent but never technically expressive—i.e., decent reading comprehension but only basic writing skills—so this was built with Claude as a pair programmer. 

It also grew organically as I automated pieces of my workflow and solved small problems over the course of a few weeks. This is the first time it’s been put together as a package. 


## The Problem
Job searching at a senior level means keeping an eye on a lot of companies. I dutifully made a spreadsheet of target companies, but keeping it current was heavy on data-entry drudgery. I come across interesting potential employers all the time, and would have to stop what I was doing to add them to the tracking sheet. Then at some point go back, do some research, manually populate info into the sheet. And then try to check back in regularly. 

The monitoring piece — *did anything change at this company since I last looked?* — was scattershot at best. 

I wanted something that would:
* Capture companies in one click as I browsed
* Enable a quick initial research pass to help decide whether I should even keep them on my radar
* Passively surface signals (new roles, funding, leadership changes) so I could act when the moment was right

⠀
## How It Works
### Stage 1 — Capture
A Chrome extension sits in your toolbar. When you land on a company's homepage, click it. The company name is pre-filled from the page title (editable if needed). One more click and the name and URL are in your tracker sheet. No copy-pasting, no tab-switching.
### Stage 2 — Research & Triage
Once a week, I open a Perplexity Space configured with a research prompt, paste in the week's new companies, and get back structured profiles: funding stage, headcount, growth indicators, hiring trends, key challenges, and a LinkedIn contact worth making. I use that to set a priority — High, Medium, Low, or Reject — in the sheet.
### Stage 3 — Monitor
Two Perplexity Tasks run on a schedule and land in my inbox:
* **High/Medium priority companies** — scanned every weekday for job postings, funding news, leadership changes, product launches, and press coverage worth commenting on
* **Low priority companies** — scanned weekly for signals that warrant upgrading their priority

⠀
## What's Included
| **File**                   | **What it is**                                               |
|----------------------------|--------------------------------------------------------------|
| extension/                 | Chrome extension source — install this first                 |
| prompts.md                 | All three Perplexity prompts (Research Space, H/M Task, Low Task) |
| chatgpt-research-prompt.md | Bonus prompt for generating a bigger company list via ChatGPT |


## Installation
**Requirements:** Google Chrome (the extension uses Chrome's identity API — Arc, Brave, and Firefox are not supported)
1. Download or clone this repo
2. Open chrome://extensions in Chrome
3. Enable **Developer Mode** (toggle in the top right)
4. Click **Load unpacked** and select the extension/ folder
5. Navigate to any webpage and click the extension icon in your toolbar
6. Click **Connect to Google** — you'll be asked to grant access to Google Drive files created by this app (nothing else)
7. Your "Company Tracker" sheet is created automatically in your Google Drive


## Your Tracker Sheet
The extension auto-creates a sheet with these columns:
| **Date Added** | **Company Name** | **URL** | **Industry** | **Size / Stage** | **Growth Indicators** | **Priority for Follow Up** | **Notes** |
Priority dropdown includes: High / Medium / Low / Reject/NA

**Note:** The extension writes to the first three columns of your sheet (Date Added, Company Name, URL). Rearranging or inserting columns before column C will create chaos. Everything from column D onward is yours to customize freely.


## The Weekly Workflow
**Daily:** Browse normally. Click the extension when you spot a company worth tracking.

**Weekday mornings:** Perplexity Task digest lands in your inbox. Scan for action signals—a role worth applying to, a funding announcement worth commenting on, a leadership change worth noting.

**Weekly (~20 min):**
1. Open the Perplexity Research Space
2. Paste new unresearched companies from your sheet
3. Use the research output to set priorities in the sheet
4. Update the Perplexity Research Tasks with new prioritized companies

⠀
## Bonus: Starting With a Bigger List
Before I had the extension, I used ChatGPT to generate an initial round of 50+ target companies as a CSV. The prompt is included in `chatgpt-research-prompt.md`—it returns structured research (funding stage, growth indicators, key challenges, priority suggestion) in a format you can paste directly into your tracker sheet.

Useful if you want to seed your list after the sheet is created, or if you want to research a specific sector all at once.


## Built With
* **Chrome Extensions API** (Manifest V3) — browser capture
* **Google Sheets API** — tracker storage
* **Perplexity** — company research and signal monitoring
* **ChatGPT** (web search enabled) — initial company list generation
* **Claude** — pair programming partner throughout

⠀
## Status
This is a working personal tool I built for my own job search and am open sourcing in case it's useful to others. It's not a polished product — there are rough edges, and I'm not providing support. Fork it, adapt it, make it yours.

**Known limitations:**
* Chrome only (no Arc, Brave, Firefox)
* Perplexity Tasks requires a Pro subscription ($20/month)
* Monitoring prompt uses a static company list that needs manual update after each triage session. I attempted to automate via Perplexity’s Google Drive integration but hit platform limitations; I ultimately decided a once-a-week manual update was an acceptable tradeoff over paying for API credits.


*Built May 2026*
