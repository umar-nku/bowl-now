import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const clientsData = [
  {
    businessName: "Holiday Bowl",
    contactName: "Tom Falbo",
    email: "tom@holidaybowlaltoona.com",
    phone: "181 Bowling Ln, Altoona, PA 16601",
    status: "active",
    clientType: "crm",
    currentPayment: "$99.00",
    proposedPayment: "$99.00",
    upsellAmount: "$1,999.00",
    notes: "Drew's relationship, paying for res and could be upsold to Boost",
    preferredCommunication: "email"
  },
  {
    businessName: "Valley Bowl",
    contactName: "Karen Warner",
    email: "karensproshop@gmail.com",
    phone: "12 Prince St # 5, Randolph, VT 05060",
    status: "active",
    clientType: "full_service",
    currentPayment: "$1,550.00",
    proposedPayment: "$1,550.00",
    upsellAmount: "$1,550.00",
    notes: "BAM client who is using our res system",
    preferredCommunication: "email"
  },
  {
    businessName: "Midway Bowl",
    contactName: "Daniel Mowery",
    email: "dan@mowery.pro",
    phone: "1561 Holly Pike, Carlisle, PA 17015",
    status: "active",
    clientType: "full_service",
    currentPayment: "$1,999.00",
    proposedPayment: "$1,999.00",
    upsellAmount: "$1,999.00",
    notes: "Paying with limited results. Never Paid / Should Be",
    preferredCommunication: "email"
  },
  {
    businessName: "Station 300 Bluffton",
    contactName: "Leah Frank",
    email: "lfrank@station300.com",
    phone: "25 Innovation Dr, Bluffton, SC 29910",
    status: "active",
    clientType: "crm_ads",
    currentPayment: "$548.00",
    proposedPayment: "$548.00",
    upsellAmount: "$548.00",
    notes: "Paying for Amplify and wants to switch to Square for invoices. Grandfathered In at Launch / Need to Re-Eval",
    preferredCommunication: "email"
  },
  {
    businessName: "Arnold's Family Fun Center",
    contactName: "David Ballenberg",
    email: "davidb@arnoldsffc.com",
    phone: "2200 West Dr, Oaks, PA 19456",
    status: "prospect",
    clientType: "crm",
    notes: "Very cheap but should be buying CRM. Active / Paying. Current: $0.00, Proposed: $0.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Station 300 Akron",
    contactName: "Devon Stewart",
    email: "devon@station300.com",
    phone: "580 E Cuyahoga Falls Ave, Akron, OH 44310",
    status: "active",
    clientType: "crm_ads",
    notes: "Paying for Amplify and wants to switch to Square for invoices. Current: $548.00, Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Station 300 Gainesville",
    contactName: "Cheyenne Ergle",
    email: "cheyenne@station300.com",
    phone: "2317 Browns Bridge Rd, Gainesville, GA 30504",
    status: "active",
    clientType: "full_service",
    notes: "Paying difference of Amplify to upgrade to Boost. Current: $1,450.00, Proposed: $1,450.00, Upsell: $2,000.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Jay Lanes",
    contactName: "Renee Talkington",
    email: "jaylanes@comcast.net",
    phone: "1428 Benjamin Franklin Hwy, Douglassville, PA 19518",
    status: "active",
    clientType: "full_service",
    notes: "Paid for year, invested $75k into BowlNow as well. Current: $1,450.00, Proposed: $1,450.00, Upsell: $2,000.00",
    preferredCommunication: "email"
  },
  {
    businessName: "MacDade Bowl",
    contactName: "Bob Pescatore",
    email: "macdadeevents@gmail.com",
    phone: "2105 MacDade Boulevard, Holmes, PA 19043",
    status: "prospect",
    clientType: "crm",
    notes: "Never paid, never had results. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Leisure Lanes",
    contactName: "Harry Yarnall",
    email: "lllanc@aol.com",
    phone: "3440 Columbia Ave, Lancaster, PA 17603",
    status: "prospect",
    clientType: "crm",
    notes: "Invested in BowlNow and grandfathered to $1 res fee. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Lakes Lanes",
    contactName: "Philip Johnson",
    email: "philip@lakeslanes.com",
    phone: "5000 Main St, The Colony, TX 75056",
    status: "active",
    clientType: "crm",
    notes: "First BowlNow customer from cold email. Current: $99.00, Proposed: $99.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Midway Berkeley Springs",
    contactName: "Theby Gregory",
    email: "theby@midwaybowl.com",
    phone: "4909 Valley Rd, Berkeley Springs, WV 25411",
    status: "active",
    clientType: "crm",
    notes: "Paying but using in very limited fashion. Current: $149.00, Proposed: $149.00, Upsell: $149.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Suitland Bowl",
    contactName: "Megan Adkins",
    email: "madkins1012@gmail.com",
    phone: "4811 Silver Hill Rd, Hillcrest Heights, MD 20746",
    status: "prospect",
    clientType: "crm",
    notes: "Drew's insurance client, stingy on spending so doubt chance to upsell. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Sims Bowling Lanes",
    contactName: "Heather Fenchel",
    email: "simsbowlinglanesandbar@gmail.com",
    phone: "7245 Big Beaver Blvd, Beaver Falls, PA 15010",
    status: "active",
    clientType: "crm_ads",
    notes: "Been through the ringer and finally working, gave discount, maybe boost. Current: $348.00, Proposed: $348.00, Upsell: $348.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Rolla Bowling Center",
    contactName: "Megan McPherson",
    email: "rollabowlingcenter@hotmail.com",
    phone: "1038 Kingshighway, Rolla, MO 65401",
    status: "active",
    clientType: "crm",
    notes: "2 site, Could be interested in CRM but doesn't have $ to increase to boost. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Plaza Lanes Meadville",
    contactName: "Ramon Rodriguez",
    email: "ramon@plazalanesmeadville.com",
    phone: "18799 Smock Hwy, Meadville, PA 16335",
    status: "prospect",
    clientType: "crm",
    notes: "Grandfathered with $1 res fee. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Station 300 Saline",
    contactName: "Amanda Johnson",
    email: "amanda.johnson@station300.com",
    phone: "830 Woodland Dr E, Saline, MI 48176",
    status: "active",
    clientType: "full_service",
    notes: "Paying difference of Amplify to upgrade to Boost. Current: $1,449.00, Proposed: $1,449.00, Upsell: $1,449.00",
    preferredCommunication: "email"
  },
  {
    businessName: "King Lanes",
    contactName: "Michelle Cominos",
    email: "kinglanes2020@gmail.com",
    phone: "590 S Water St, Kittanning, PA 16201",
    status: "active",
    clientType: "crm",
    notes: "Drews lead, need to figure out standing. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Salem Bowling Center",
    contactName: "Megan McPherson",
    email: "salembowlingcenter@hotmail.com",
    phone: "1201B E Scenic Rivers Blvd, Salem, MO 65560",
    status: "active",
    clientType: "crm",
    notes: "2 site, Could be interested in CRM but doesn't have $ to increase to boost. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Lincoln Lanes",
    contactName: "Ed Zuzak",
    email: "lezlanes@yahoo.com",
    phone: "3850 US-30, Latrobe, PA 15650",
    status: "prospect",
    clientType: "crm",
    notes: "Switching to Qubica, will circle back once their trial period is over. Current: $99.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Glen Burnie Bowl",
    contactName: "DeAnna Rhine",
    email: "d.rhine@icloud.com",
    phone: "6322 Ritchie Hwy, Glen Burnie, MD 21061",
    status: "canceled",
    clientType: "crm",
    notes: "Closing for good soon. Current: $99.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Mohawk Lanes",
    contactName: "Michele Householder",
    email: "mohawkln@yahoo.com",
    phone: "1924 Oakland Ave, Indiana, PA 15701",
    status: "active",
    clientType: "crm_ads",
    notes: "Drews lead, need to figure out standing. Current: , Proposed: $449.00, Upsell: $449.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Zone 28",
    contactName: "Alex Guntrum",
    email: "alex@zone28.com",
    phone: "2525 Freeport Rd, Pittsburgh, PA 15238",
    status: "active",
    clientType: "crm_ads",
    notes: "Paying for amplify. Might do boost. Current: $449.00, Proposed: $449.00, Upsell: $449.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Station 300 Grandville",
    contactName: "Jason Butler",
    email: "jason@station300.com",
    phone: "3335 Fairlanes Ave SW, Grandville, MI 49418",
    status: "active",
    clientType: "crm_ads",
    notes: "Paying for Amplify and wants to switch to Square for invoices. Current: $548.00, Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Imperial Lanes",
    contactName: "Alexis Neuer",
    email: "ajn300844@gmail.com",
    phone: "679 S Front St, Milton, PA 17847",
    status: "prospect",
    clientType: "crm",
    notes: "Never paid, never had results. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Stoneleigh Lanes",
    contactName: "Richard Briggs",
    email: "rrbriggs@gmail.com",
    phone: "6703 York Rd, Baltimore, MD 21212",
    status: "active",
    clientType: "full_service",
    notes: "Angry emails and paid for full year with 3 month onboarding. Current: $1,799.00, Proposed: $1,799.00, Upsell: $1,799.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Centennial Lanes",
    contactName: "Ty Herreman",
    email: "tylerherreman@yahoo.com",
    phone: "2400 Vine St, Hays, KS 67601",
    status: "prospect",
    clientType: "crm",
    notes: "BPAA Pres with small center. Let him have for free. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "State Street Lanes",
    contactName: "Mitchell Diodato",
    email: "mitchell.diodato@gmail.com",
    phone: "619 State St, Hamburg, PA 19526",
    status: "active",
    clientType: "crm_ads",
    notes: "Small center needing discount on Amplify. Current: $99.00, Proposed: $368.00, Upsell: $368.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Sandwich Bowl",
    contactName: "Darrell Willis",
    email: "sandwichbowling@gmail.com",
    phone: "927 E Railroad St, Sandwich, IL 60548",
    status: "prospect",
    clientType: "crm",
    notes: "Guy is leveraging GHL to try to sell similar packages to BowlNow. He should pay or get fucked. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Amity Bowl",
    contactName: "Barb Watts",
    email: "bowlamity@aol.com",
    phone: "30 Selden St, Woodbridge, CT 06525",
    status: "active",
    clientType: "crm",
    notes: "BPAA board member using res payments in league house. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Depot Family Fun Center",
    contactName: "Beverley Enterkin",
    email: "12strikesbeverly@gmail.com",
    phone: "257 W Beacon St Ste. 1, Philadelphia, MS 39350",
    status: "prospect",
    clientType: "crm",
    notes: "First close at Expo and pays dollar res fee. Could be upgraded to leverage at her roller rink. Middle of Mississippi. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Spare Time Lanes",
    contactName: "Bill Reese",
    email: "reeseb528@gmail.com",
    phone: "17 Tide Rd, Tamaqua, PA 18252",
    status: "prospect",
    clientType: "crm",
    notes: "Chasing around to go live. Drews client. Current: $0.00, Proposed: $0.00, Upsell: $0.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Buffaloe Lanes Mebane",
    contactName: "Bryan Collier",
    email: "bryanc@buffaloelanes.com",
    phone: "103 S Fifth St, Mebane, NC 27302",
    status: "active",
    clientType: "crm",
    notes: "Struggled with build and finally got live. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Forest View Lanes",
    contactName: "Richard Kenny",
    email: "rich@forestviewlanes.com",
    phone: "2345 W Dean Rd, Temperance, MI 48182",
    status: "active",
    clientType: "full_service",
    notes: "4 Month onboarding with 100 page website. Current: , Proposed: $1,999.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Pleasant Hill Lanes",
    contactName: "Woody Woodward",
    email: "charles@bowlphl.com",
    phone: "1001 W Newport Pike, Wilmington, DE 19804",
    status: "active",
    clientType: "full_service",
    notes: "Paid for year in advance. Current: $1,499.00, Proposed: $1,499.00, Upsell: $1,499.00",
    preferredCommunication: "email"
  },
  {
    businessName: "The Party Palace",
    contactName: "Craig Tincher",
    email: "kysteel@gmail.com",
    phone: "1803 N Main St, London, KY 40741",
    status: "active",
    clientType: "crm",
    notes: "Upgraded then downgraded to just res. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Island Bowl",
    contactName: "Joe Zarolli",
    email: "joe@irgroupnj.com",
    phone: "3401 New Jersey Ave, Wildwood, NJ 08260",
    status: "active",
    clientType: "full_service",
    notes: "Fastest onboarding to boost. Current: $1,990.00, Proposed: $1,999.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "222 Dutch Lanes",
    contactName: "Eric Montgomery",
    email: "eric@dutchlanes.com",
    phone: "4311 Oregon Pike, Ephrata, PA 17522",
    status: "active",
    clientType: "crm_ads",
    notes: "Using CRM and has interest in Boost but not full cost. Current: $449.00, Proposed: $449.00, Upsell: $1,499.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Official's Bowl & Spirits",
    contactName: "Jeremy Fischer",
    email: "jfischer920@gmail.com",
    phone: "408 N 8th St, Hilbert, WI 54129",
    status: "prospect",
    clientType: "crm",
    notes: "Sparsely using res system, need to get paying $99 first because payments have failed. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Batavia Bowl",
    contactName: "Dan Bedinghaus",
    email: "bedinghaus@mac.com",
    phone: "1991 James E. Sauls Sr. Dr, Batavia, OH 45103",
    status: "prospect",
    clientType: "crm",
    notes: "Has interest in Boost but wants res right first with Fiserv. Current: , Proposed: $99.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Eastgate Lanes",
    contactName: "Dan Bedinghaus",
    email: "bedinghaus@mac.com",
    phone: "1362 OH-28, Loveland, OH 45140",
    status: "prospect",
    clientType: "crm",
    notes: "Has interest in Boost but wants res right first with Fiserv. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Revs Bowl Bar & Grill",
    contactName: "Erik Gialdella",
    email: "erik@bowlrevs.com",
    phone: "275 N Washburn St, Oshkosh, WI 54904",
    status: "active",
    clientType: "crm_ads",
    notes: "2 site, paying for res and crm but not getting much use. Current: $647.00, Proposed: $647.00, Upsell: $647.00",
    preferredCommunication: "email"
  },
  {
    businessName: "The 300 Club of Green Lake",
    contactName: "Erik Gialdella",
    email: "erik@bowlrevs.com",
    phone: "W1802 Co Rd A, Green Lake, WI 54941",
    status: "prospect",
    clientType: "crm",
    notes: "2 site, paying for res and crm but not getting much use. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Bowlocity Entertainment Center",
    contactName: "Erin Glorvigen",
    email: "info@bolwocity.com",
    phone: "2810 N Broadway Ave, Rochester, MN 55906",
    status: "active",
    clientType: "crm_ads",
    notes: "Great guy using CRM. Need to discuss Boost. Current: $449.00, Proposed: $449.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Presidio Bowl",
    contactName: "Victor Meyerhoff",
    email: "victor@presidiobowl.com",
    phone: "93 Moraga Ave, San Francisco, CA 94129",
    status: "prospect",
    clientType: "crm_ads",
    notes: "Said he would go live and never did. Current: , Proposed: $449.00, Upsell: $449.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Allenberry",
    contactName: "Mike Kennedy",
    email: "mkennedy@americantrack.com",
    phone: "1559 Boiling Springs Rd, Boiling Springs, PA 17007",
    status: "active",
    clientType: "crm_ads",
    notes: "Using CRM. Current: $4,500.00, Proposed: $4,500.00, Upsell: $4,500.00",
    preferredCommunication: "email"
  },
  {
    businessName: "S&S Speedways",
    contactName: "Denise Smith",
    email: "denise@ssspeedways.com",
    phone: "7062 US-209, Stroudsburg, PA 18360",
    status: "active",
    clientType: "crm_ads",
    notes: "No idea why this is so low with Amplify? Current: $200.00, Proposed: $200.00, Upsell: $200.00",
    preferredCommunication: "email"
  },
  {
    businessName: "SuperPlay",
    contactName: "Terry Pierce",
    email: "terry@superplayor.com",
    phone: "9300 SW Beaverton-Hillsdale Hwy, Beaverton, OR 97005",
    status: "prospect",
    clientType: "crm",
    notes: "Swamped and wanting to get started on res. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "V&S Lanes",
    contactName: "Steve Fred",
    email: "steve@vnslanes.com",
    phone: "7235 Elmwood Ave, Philadelphia, PA 19142",
    status: "prospect",
    clientType: "crm",
    notes: "Account built out but hasn't been using, trouble with sticky banner on wix. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Timbers Bowling Lanes",
    contactName: "Martin Teifke",
    email: "mttimbers@sbcglobal.net",
    phone: "1246 Conant St, Maumee, OH 43537",
    status: "active",
    clientType: "crm",
    notes: "BPAA board member using our software. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Doug Kent's Rose Bowl Lanes",
    contactName: "Chrissie Kent",
    email: "chrissie@dougkentsrosebowllanes.com",
    phone: "725 W Miller St, Newark, NY 14513",
    status: "active",
    clientType: "crm",
    notes: "Happy with res system, potential to upsell to CRM. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Frontier Lanes",
    contactName: "Ernest Simmons",
    email: "frontierlanes@sbcglobal.net",
    phone: "3524 N Washington St, Stillwater, OK 74075",
    status: "prospect",
    clientType: "crm",
    notes: "Have tried going through onboarding multiple times but gets unresponsive. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Park Center Lanes",
    contactName: "Bob Lomonaco",
    email: "bob@parkcenterlanes.com",
    phone: "2222 28th St SW, Wyoming, MI 49519",
    status: "active",
    clientType: "crm",
    notes: "Paying but never got onboarded after multiple attempts. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Snake River Bowl",
    contactName: "Justin Struder",
    email: "snakeriverbowl@gmail.com",
    phone: "725 Minidoka Ave, Burley, ID 83318",
    status: "active",
    clientType: "crm",
    notes: "Happy with res and wants Boost. Current: $99.00, Proposed: $99.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Kingpins Alley - Latham",
    contactName: "Doug Bohannon",
    email: "kingpin300@adelphia.net",
    phone: "375 Troy Schenectady Road, Latham, NY 12110",
    status: "active",
    clientType: "crm_ads",
    notes: "Closed 2 sites and using CRM only. Current: , Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Kingpins Alley - South Glen Falls",
    contactName: "Doug Bohannon",
    email: "kingpin300@adelphia.net",
    phone: "166 Saratoga Ave. South, Glens Falls, NY 12803",
    status: "active",
    clientType: "crm_ads",
    notes: "Closed 2 sites and using CRM only. Current: $548.00, Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Richfield BOWL-A-RAMA!",
    contactName: "Peyton Carter",
    email: "info@richfield-bowlarama.com",
    phone: "20 Bronner St, Richfield Springs, NY 13439",
    status: "active",
    clientType: "crm_ads",
    notes: "A difficult client with no idea where they stand. Current: $249.00, Proposed: $249.00, Upsell: $249.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Crossroads Social House",
    contactName: "Nick Patel",
    email: "nickpatel1975@gmail.com",
    phone: "180 Dominion St, Wytheville, VA 24382",
    status: "active",
    clientType: "crm_ads",
    notes: "Heavy use of res and CRM, prime Boost upsell. Current: $548.00, Proposed: $548.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Lost Lanes",
    contactName: "Natalie Hanks",
    email: "nat4hanks@gmail.com",
    phone: "160 Grant St, Cambridge Springs, PA 16403",
    status: "prospect",
    clientType: "crm",
    notes: "Waiting for Fiserv integration. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Sport Bowl",
    contactName: "Bryan Parker",
    email: "bparker82@hotmail.com",
    phone: "1901 W Burnside St, Sioux Falls, SD 57104",
    status: "prospect",
    clientType: "crm",
    notes: "Need payment. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Split Happens Bowling Center",
    contactName: "Rick Holland",
    email: "rholland81201@gmail.com",
    phone: "7615 US-50, Salida, CO 81201",
    status: "active",
    clientType: "crm",
    notes: "Happy with res system. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Suburban Bowlerama",
    contactName: "Terry Miller",
    email: "terry@suburbanbowlerama.com",
    phone: "1945 S Queen St, York, PA 17403",
    status: "active",
    clientType: "crm_ads",
    notes: "Terry Miller could be upsold. Current: $199.00, Proposed: $199.00, Upsell: $1,499.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Orange Bowl Lanes",
    contactName: "Chris Stabile",
    email: "stabilechristopher10@gmail.com",
    phone: "1221 E Vine St, Kissimmee, FL 34744",
    status: "active",
    clientType: "crm",
    notes: "Onboarding stalled from client end, don't see them being more than res. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Emerald Bowl",
    contactName: "Don Ellis",
    email: "don.ellis@emerald-bowl.com",
    phone: "9307 Boone Rd, Houston, TX 77099",
    status: "prospect",
    clientType: "crm",
    notes: "Needs to pay and have Fiserv. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Chick's Lanes",
    contactName: "Carrie Preischel",
    email: "carrie@preischelrealty.com",
    phone: "8196 Erie Rd, Angola, NY 14006",
    status: "prospect",
    clientType: "crm_ads",
    notes: "Ghosted after onboarding for res and portion of CRM, was insistent on per game pricing. Current: , Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Eastown Recreation Center",
    contactName: "Chelsea Kiefer",
    email: "eastownrec@hotmail.com",
    phone: "1370 Crossroads Ave, Jasper, IN 47546",
    status: "active",
    clientType: "crm",
    notes: "Happy with res system. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "World of Sports",
    contactName: "Jay Burnett",
    email: "jburnett@worldofsportsfun.com",
    phone: "2030 Bill Tuck Hwy, South Boston, VA 24592",
    status: "prospect",
    clientType: "crm",
    notes: "Agreed but wants in person onboarding from Dan. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Great River Bowl",
    contactName: "Jason Mathiasen",
    email: "jason@greatriverbowl.com",
    phone: "208 2nd St S, Sartell, MN 56377",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,550.00, Proposed: $1,550.00, Upsell: $1,550.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Classic Lanes",
    contactName: "James Selke",
    email: "jselke5023@aol.com",
    phone: "2145 Avon Industrial Dr, Rochester Hills, MI 48309",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,550.00, Proposed: $1,550.00, Upsell: $1,550.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Bertrand Lanes",
    contactName: "John Sarantakis",
    email: "john@funwithrocky.com",
    phone: "2616 Washington St, Waukegan, IL 60085",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,550.00, Proposed: $1,550.00, Upsell: $1,550.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Bellefonte Lanes",
    contactName: "Alissa Jaworski",
    email: "alissa_jaworski@yahoo.com",
    phone: "2767 Benner Pike, Bellefonte, PA 16823",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,550.00, Proposed: $1,550.00, Upsell: $1,550.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Oakwood Bowl",
    contactName: "Sean Mathis",
    email: "seanm821@yahoo.com",
    phone: "4709 W Owen K Garriott Rd, Enid, OK 73703",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,550.00, Proposed: $1,550.00, Upsell: $1,550.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Pineville Bowl",
    contactName: "Tom Bellach",
    email: "tom@thepinevillebowl.com",
    phone: "13765 US-71, Pineville, MO 64856",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $387.50, Proposed: $387.00, Upsell: $387.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Our Town Alley",
    contactName: "Anthony Taormina",
    email: "anthonyt@ourtownalley.com",
    phone: "2912 Swede Rd, East Norriton, PA 19401",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,350.00, Proposed: $1,350.00, Upsell: $1,350.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Roseland Lanes",
    contactName: "Anna Marie Slaby",
    email: "annamarie@roselandlanes.com",
    phone: "26383 Broadway Ave, Oakwood, OH 44146",
    status: "active",
    clientType: "full_service",
    notes: "BAM Client. Current: $1,550.00, Proposed: $1,550.00, Upsell: $1,550.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Eden Bowling Center",
    contactName: "Carrie Preischel",
    email: "carrie@preischelrealty.com",
    phone: "8716 S Main St, Eden, NY 14057",
    status: "prospect",
    clientType: "crm_ads",
    notes: "BAM CRM Only. Current: , Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Grand Station",
    contactName: "Scott Logan",
    email: "scott@grandstationent.com",
    phone: "2400 Earl Rudder Fwy, College Station, TX 77840",
    status: "prospect",
    clientType: "crm_ads",
    notes: "Wants the software but never onboarded. Current: , Proposed: $548.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Northern Lights Recreation",
    contactName: "Bill Lloyd",
    email: "blloyd@coachhousepetoskey.com",
    phone: "8865 M-119 Harbor Springs, MI 49740",
    status: "active",
    clientType: "full_service",
    notes: "Paused payments until full live. Current: $1,499.00, Proposed: $1,499.00, Upsell: $1,499.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Center Lanes",
    contactName: "Elio Filippi",
    email: "eliofilippi@icloud.com",
    phone: "3084 Brodhead Rd, Aliquippa, PA 15001",
    status: "active",
    clientType: "crm_ads",
    notes: "Don't see going higher than CRM. Current: $548.00, Proposed: $548.00, Upsell: $548.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Lord Calvert Bowl",
    contactName: "Luke Williamson",
    email: "lukew@lordcalvertbowl.com",
    phone: "2275 Solomons Island Rd, Huntingtown, MD 20639",
    status: "active",
    clientType: "crm_ads",
    notes: "Paid for the year. Current: $429.17, Proposed: $429.17, Upsell: $429.17",
    preferredCommunication: "email"
  },
  {
    businessName: "Fast Lanes Bowl",
    contactName: "Lori Barnard",
    email: "fastlanesbowl@aol.com",
    phone: "107 S Paul Carr Dr, Checotah, OK 74426",
    status: "active",
    clientType: "crm",
    notes: "Nice lady with rural center. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Greenacres Bowl",
    contactName: "Chris Arbour",
    email: "chrisarbour@gatorbowling.com",
    phone: "6126 Lake Worth Rd, Greenacres, FL 33463",
    status: "active",
    clientType: "crm_ads",
    notes: "Son is using and he is using Meriq res. Current: $449.00, Proposed: $449.00, Upsell: $449.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Kent Bowl",
    contactName: "Jason Mitchell",
    email: "mitchelljl0004@gmail.com",
    phone: "1234 Central Ave N, Kent, WA 98032",
    status: "active",
    clientType: "crm",
    notes: "Just closed and onboarded. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Go Time Karting",
    contactName: "Chris Tyrrel",
    email: "cgtyrrel@yahoo.com",
    phone: "984 North Colony Rd, Wallingford, CT 06492",
    status: "active",
    clientType: "full_service",
    notes: "Boost client looking for more conversions on ads. Current: $1,999.00, Proposed: $1,999.00, Upsell: $1,999.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Madsen's Bowling & Billiards",
    contactName: "Sara Madsen",
    email: "sara@madsenslincoln.com",
    phone: "4700 Dudley St, Lincoln, NE 68503",
    status: "active",
    clientType: "crm",
    notes: "Res client, once college is back in session showed interest in starting boost. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Bogart's Entertainment Center",
    contactName: "Christoper Loth",
    email: "chris@bogartsentertainmentcenter.com",
    phone: "14917 Garrett Ave, Apple Valley, Minnesota 55124",
    status: "active",
    clientType: "crm",
    notes: "Happy with res system, complaining about reporting. Current: $99.00, Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Valley Bowling Lanes",
    contactName: "Cindy Grabowski",
    email: "valleybowlinglanespa@gmail.com",
    phone: "1 Meredith St, Carbondale, PA 18407",
    status: "prospect",
    clientType: "crm",
    notes: "Onboarding completed for res, not sure if they'd pay for CRM/Boost but Drew would have an idea. Current: , Proposed: $99.00, Upsell: $99.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Three Rivers Karting",
    contactName: "Daryl Charlier",
    email: "dcharlier@threeriverskarting.com",
    phone: "541 Avenue B, Building 10 Leetsdale, PA 15056",
    status: "active",
    clientType: "crm_ads",
    notes: "Carting place using Amplify. Current: $499.00, Proposed: $499.00, Upsell: $499.00",
    preferredCommunication: "email"
  },
  {
    businessName: "Farmington Lanes",
    contactName: "Dustin Kimmes",
    email: "dustin@farmingtonlanes.com",
    phone: "27 5th St, Farmington, MN 55024",
    status: "active",
    clientType: "crm_ads",
    notes: "In onboarding. Current: $549.00, Proposed: $549.00, Upsell: $549.00",
    preferredCommunication: "email"
  }
];

async function importClients() {
  const client = await pool.connect();
  
  try {
    console.log('Starting client import...');
    
    for (const clientData of clientsData) {
      console.log(`Importing ${clientData.businessName}...`);
      
      await client.query(`
        INSERT INTO clients (
          business_name, 
          contact_name, 
          email, 
          phone, 
          status, 
          client_type, 
          current_payment,
          proposed_payment,
          upsell_amount,
          notes, 
          preferred_communication,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      `, [
        clientData.businessName,
        clientData.contactName,
        clientData.email,
        clientData.phone,
        clientData.status,
        clientData.clientType,
        clientData.currentPayment,
        clientData.proposedPayment,
        clientData.upsellAmount,
        clientData.notes,
        clientData.preferredCommunication
      ]);
    }
    
    console.log(`Successfully imported ${clientsData.length} clients!`);
    
  } catch (error) {
    console.error('Error importing clients:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

importClients();