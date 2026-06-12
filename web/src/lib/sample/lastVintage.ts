import type { MysteryPackage } from "../types";

// "The Last Vintage" — the hand-authored benchmark mystery that powers the
// offline provider. It demonstrates the structural rules the real Writers'
// Room must satisfy: solution-first construction, two independent inference
// chains, falsifiable red herrings, dual-victory objectives, and no dead roles.
//
// Characters are ordered so the crime's core web lives in the first four —
// the package stays solvable when trimmed to smaller player counts.

export const LAST_VINTAGE: MysteryPackage = {
  title: "The Last Vintage",
  logline:
    "At the 50th-anniversary gala of Rosewood Estate, matriarch Vivienne Rosewood is found dead beneath a toppled barrel rack — and the accident is anything but.",
  tonalNorthStar:
    "A family that loves each other with knives behind their backs: warm candlelight, cold motives.",
  setting:
    "Rosewood Estate, a storied family winery in the valley. Tonight: the 50th-anniversary gala. String lights on the terrace, a barrel cellar below, and a storm rolling in that has closed the only road out.",
  whyTonight:
    "At midnight, Vivienne planned to announce a change to her will and the future of the estate. Everyone here had until midnight to stop her.",
  victim: {
    name: "Vivienne Rosewood",
    role: "Founder & matriarch of Rosewood Estate",
    description:
      "Charming, ruthless, and dying — though only one person here knows that. She built the estate from a failing orchard, made enemies the way other people make small talk, and loved her children just slightly less than her vineyard.",
  },

  characters: [
    {
      id: "margaux",
      name: "Margaux Rosewood",
      role: "Heir apparent & COO of the estate",
      publicPersona:
        "The dutiful daughter who runs everything while her mother takes the credit. Impeccable, controlled, never a hair out of place — the kind of person who smiles while doing math.",
      privateSelf:
        "You have spent twenty years earning an inheritance your mother dangled like a carrot. This afternoon you learned she was about to snatch it away. You are done waiting.",
      connectionToVictim:
        "Daughter. You ran the estate's operations for two decades while Vivienne overruled you in public and praised you in private — never the reverse.",
      costume: "A power suit in wine-dark red. Vintage brooch. Sensible shoes you could run in.",
      secrets: [
        {
          id: "margaux-s1",
          text: "You have been secretly negotiating to sell the estate to the Caldwell Group. The papers are ready. Mother found out this afternoon — and told you she was changing her will tonight to make the sale impossible.",
          category: "crimeWeb",
        },
        {
          id: "margaux-s2",
          text: "You saw the draft of the new will. You were not in it as an heir — only as a salaried 'estate director'. There is another heir named. You don't know who... officially.",
          category: "crimeWeb",
        },
      ],
      objectives: [
        { id: "margaux-o1", text: "Keep anyone from connecting you to the storeroom between 6 and 6:30 PM.", type: "protect", successCriteria: "No one places you near the storeroom before the finale." },
        { id: "margaux-o2", text: "Steer suspicion toward Theo — his debts make him an easy story.", type: "broker", successCriteria: "At least two guests name Theo as their lead suspect." },
        { id: "margaux-o3", text: "Recover the seating chart you scribbled — you wrote it on the wrong piece of paper.", type: "obtain", successCriteria: "You learn where the seating chart is before it's revealed." },
      ],
      relationships: [
        { characterId: "theo", publicLabel: "Brother", privateTruth: "You've covered his debts twice. You're done — and he knows too much about your meetings with Caldwell." },
        { characterId: "elena", publicLabel: "Trusted estate manager", privateTruth: "Mother trusted Elena more than you. That always stung. Tonight you found out why." },
        { characterId: "hart", publicLabel: "Family doctor & mother's oldest friend", privateTruth: "She knows something about mother's health she isn't saying. You need to know what." },
      ],
      voice: {
        sampleLines: [
          "\"Mother built this estate. I merely keep it from burning down — daily.\"",
          "\"Grief is a luxury. Someone has to keep the lights on.\"",
          "\"Theo, darling, where were you when it happened? Asking for... everyone.\"",
        ],
        tic: "Checks her watch when lying.",
        howToPlayMe: "Be the most composed person in the room — let the cracks show only when someone mentions the will.",
      },
      whatToKnow: [
        "The gala schedule was your design; you know where everyone was supposed to be.",
        "The estate is losing money. Only you and the lawyer know how much.",
        "Your mother's private reserve glass is poured by family tradition — by you.",
      ],
    },
    {
      id: "theo",
      name: "Theo Rosewood",
      role: "Son, sommelier & charming disaster",
      publicPersona:
        "The fun Rosewood. Knows every vintage, every guest's name, and every card game in the valley. Broke in a way that's starting to show at the cuffs.",
      privateSelf:
        "You owe the kind of people you shouldn't owe. You've been quietly 'extending' the estate's reserve collection with counterfeit bottles and selling the real ones. Someone found out, and tonight they wanted to be paid.",
      connectionToVictim:
        "Son. Vivienne adored you and trusted you with nothing — she was right not to.",
      costume: "A velvet dinner jacket, slightly too lived-in. A corkscrew on a chain.",
      secrets: [
        { id: "theo-s1", text: "You've been selling counterfeit bottles of the estate's reserve to cover gambling debts. Six fakes are in the cellar right now.", category: "crimeWeb" },
        { id: "theo-s2", text: "A blackmailer signing as 'B' demanded payment tonight — terrace, 6:05 PM sharp. You went. That's your alibi, and revealing it ruins you.", category: "crimeWeb" },
      ],
      objectives: [
        { id: "theo-o1", text: "Keep the counterfeits from being traced to you.", type: "protect", successCriteria: "No one proves you made the swaps." },
        { id: "theo-o2", text: "Find out who 'B' is and get the ledger they're holding back.", type: "obtain", successCriteria: "You name your blackmailer before the finale." },
        { id: "theo-o3", text: "Get Margaux to admit what she was really doing this afternoon.", type: "extract", successCriteria: "Margaux says the word 'Caldwell' where you can hear it." },
      ],
      relationships: [
        { characterId: "margaux", publicLabel: "Sister", privateTruth: "She's bailed you out twice and despises you for it. You saw a Caldwell Group folder in her car." },
        { characterId: "bianca", publicLabel: "Rival winery owner, old flame", privateTruth: "You sold her two bottles last spring. If anyone could spot a fake, it's her." },
        { characterId: "elena", publicLabel: "Estate manager since you were a kid", privateTruth: "She caught you in the cellar at odd hours twice. She hasn't told mother. Why not?" },
      ],
      voice: {
        sampleLines: [
          "\"I can tell you the vintage of anything in this room. People included.\"",
          "\"Debts? I prefer the term 'enthusiastic investments'.\"",
          "\"I was... taking the air at six. Alone. With the air.\"",
        ],
        tic: "Refills the nearest glass when cornered.",
        howToPlayMe: "Deflect everything with charm; panic only when someone heads toward the cellar's back rack.",
      },
      whatToKnow: [
        "You know wine — you can authenticate or debunk any bottle on sight.",
        "You saw Elena's master key hanging at the tasting desk during the 5:30 tasting.",
        "Your mother drank only from her private reserve glass at toasts. Family rule.",
      ],
    },
    {
      id: "elena",
      name: "Elena Vasquez",
      role: "Estate manager, 22 years of service",
      publicPersona:
        "The person who actually runs the vineyard. Calm, weatherworn, loyal — the staff would walk into fire for her, and the family barely sees her.",
      privateSelf:
        "Three months ago a DNA test confirmed what your mother told you on her deathbed: Vivienne Rosewood is your biological mother. You wrote to her. Last week, she answered — and tonight she was going to tell everyone.",
      connectionToVictim:
        "Employer for 22 years — and, secretly, your mother. She hired you knowing. You only just found out.",
      costume: "Field jacket over a good dress — someone who came to a gala from work, because she did.",
      secrets: [
        { id: "elena-s1", text: "You are Vivienne's biological daughter. The new will names you. If that's discovered, you have the strongest motive in the room — and you're innocent.", category: "crimeWeb" },
        { id: "elena-s2", text: "You keep the pesticide cabinet — including the old nicotine concentrate that should have been disposed of years ago. You begged Vivienne twice to pay for proper removal. She refused.", category: "crimeWeb" },
      ],
      objectives: [
        { id: "elena-o1", text: "Keep your parentage secret until you choose to reveal it — on your terms, not the room's.", type: "protect", successCriteria: "You reveal it yourself, or it stays hidden." },
        { id: "elena-o2", text: "Account for your master key — you checked it in at the tasting desk and someone needs to remember that.", type: "broker", successCriteria: "A witness confirms your key was checked in before 6 PM." },
        { id: "elena-o3", text: "Find Vivienne's letter to you. She carried it tonight. It isn't on her.", type: "obtain", successCriteria: "You hold the letter before the finale." },
      ],
      relationships: [
        { characterId: "margaux", publicLabel: "The boss's daughter", privateTruth: "Your half-sister. She inherits your silence either way — unless the will speaks first." },
        { characterId: "hart", publicLabel: "The doctor who visits monthly", privateTruth: "She drew the blood for your DNA test. She knows everything and has said nothing." },
        { characterId: "theo", publicLabel: "The charming one", privateTruth: "You caught him in the cellar twice at night. You kept it quiet — leverage you hate holding." },
      ],
      voice: {
        sampleLines: [
          "\"The vines don't care whose name is on the gate. Neither do I.\"",
          "\"That cabinet has been locked since five. I can prove it. I think I can prove it.\"",
          "\"Vivienne and I understood each other. Lately... more than usual.\"",
        ],
        tic: "Touches the key ring on her belt when nervous — even now that one key is missing from it.",
        howToPlayMe: "Quiet competence. You have nothing to hide except the one thing that makes you look guiltiest.",
      },
      whatToKnow: [
        "The pesticide cabinet log is in the storeroom — every opening is recorded.",
        "Three master keys exist: yours, Vivienne's, and Margaux's.",
        "The barrel rack that fell was inspected last month. It was sound.",
      ],
    },
    {
      id: "hart",
      name: "Dr. Celeste Hart",
      role: "Family physician & Vivienne's oldest friend",
      publicPersona:
        "Dry-witted, unshockable, the only person who ever told Vivienne 'no' and stayed invited. Semi-retired, still keeps three patients: the Rosewoods.",
      privateSelf:
        "Vivienne was dying — eight weeks, maybe ten. She swore you to secrecy and made you falsify her file so no one could contest her 'sound mind' when she changed the will. Tonight you helped your best friend set a trap she didn't live to spring.",
      connectionToVictim:
        "Best friend for forty years, physician for thirty. You knew her secrets, including the last one.",
      costume: "An elegant older suit, a doctor's bag she brings everywhere 'out of habit'.",
      secrets: [
        { id: "hart-s1", text: "Vivienne was terminally ill and knew it. You falsified her records at her request so the new will couldn't be challenged.", category: "crimeWeb" },
        { id: "hart-s2", text: "You examined the body before anyone else. The 'accident' didn't kill her — there was no bleeding under the rack. You haven't said so yet, because the moment you do, the falsified records surface.", category: "personal" },
      ],
      objectives: [
        { id: "hart-o1", text: "Get the truth of the death established without your falsified records coming to light.", type: "broker", successCriteria: "The room accepts it was murder, and your records stay buried." },
        { id: "hart-o2", text: "Protect the person the new will protects — Vivienne died for that will.", type: "protect", successCriteria: "The named heir is not convicted, and the will's intent survives." },
      ],
      relationships: [
        { characterId: "elena", publicLabel: "The estate manager — your favorite person here", privateTruth: "You drew her DNA sample. You've been guarding her secret and Vivienne's together." },
        { characterId: "margaux", publicLabel: "The capable one", privateTruth: "Vivienne told you yesterday: 'Margaux found out. Watch her hands tonight, Celeste.'" },
      ],
      voice: {
        sampleLines: [
          "\"I've signed three death certificates in this valley. I won't sign a wrong one.\"",
          "\"Vivienne planned everything. Including, I suspect, this conversation.\"",
          "\"Take it from a doctor: barrel racks don't kill people who are already dead.\"",
        ],
        tic: "Polishes her glasses before delivering bad news.",
        howToPlayMe: "You know the most and can say the least. Dole out the truth in doses, like medicine.",
      },
      whatToKnow: [
        "Time of death was between 6:00 and 6:30 — before the rack fell at 6:45.",
        "Nicotine poisoning presents as cardiac arrest. Old vineyards kept nicotine sulfate as pesticide.",
        "Vivienne carried a letter tonight she meant to deliver at midnight.",
      ],
    },
    {
      id: "julian",
      name: "Julian Cross",
      role: "Wine critic — or so the invitation says",
      publicPersona:
        "A sharp-tongued critic whose review could make the estate's next decade. Everyone is being very, very nice to him.",
      privateSelf:
        "You're an investigative journalist. In 1979, Vivienne's founding partner Edward Voss vanished — officially 'left the country'. Your editor doesn't know you're here; your sources say the truth never left this property.",
      connectionToVictim:
        "Stranger to her face, scholar of her past. You requested this invitation under your critic pseudonym; she granted it — which makes you wonder if she knew.",
      costume: "Critic-chic: dark blazer, notebook, an expression of professional disappointment.",
      secrets: [
        { id: "julian-s1", text: "You are not a wine critic. One person here could expose you the moment they ask a real question about tannins.", category: "personal" },
        { id: "julian-s2", text: "You have a 1979 photograph of Vivienne, Edward Voss, and a young woman who is unmistakably Dr. Hart, taken the week Voss disappeared.", category: "crimeWeb" },
      ],
      objectives: [
        { id: "julian-o1", text: "Keep your cover until you have the Voss story.", type: "protect", successCriteria: "No one proves you're not a critic." },
        { id: "julian-o2", text: "Get Dr. Hart to talk about 1979.", type: "extract", successCriteria: "Hart acknowledges the photograph or names Voss." },
        { id: "julian-o3", text: "Tonight's murder is a fresh page — document who benefits.", type: "obtain", successCriteria: "You correctly name the culprit at the finale." },
      ],
      relationships: [
        { characterId: "hart", publicLabel: "A guest you've just met", privateTruth: "She's in your 1979 photograph. She was here when Voss vanished." },
        { characterId: "bianca", publicLabel: "Fellow industry guest", privateTruth: "She clocked your fake credentials in the first ten minutes. She's said nothing. Yet." },
      ],
      voice: {
        sampleLines: [
          "\"The nose is... ambitious. Like everyone at this party.\"",
          "\"I find history more intoxicating than wine. This estate has both.\"",
          "\"Off the record — a phrase I use professionally — where were you at six?\"",
        ],
        tic: "Writes in his notebook at suspicious moments, which is all of them.",
        howToPlayMe: "Ask questions like a critic, listen like a reporter. You're the table's natural detective — use it.",
      },
      whatToKnow: [
        "Estate records from 1979 are kept in the cellar office.",
        "Vivienne bought out Edward Voss's family for a suspicious pittance in 1980.",
        "A professional photographer is documenting tonight — timestamped shots of everything.",
      ],
    },
    {
      id: "bianca",
      name: "Bianca Moreau",
      role: "Owner of Moreau Vineyards, the rival across the valley",
      publicPersona:
        "Glamorous, sharp, and openly delighted to be invited into the enemy's house. Lost three gold medals to Rosewood in a row and mentions it constantly, as a joke, not as a joke.",
      privateSelf:
        "You've known Theo's reserve bottles were fakes since spring — you bought two. You've been bleeding him for 'consulting fees' since. Tonight was a collection night: terrace, 6:05. He paid. You watched the cellar door the whole time.",
      connectionToVictim:
        "Rival for thirty years. Vivienne once called your pinot 'a brave little experiment' in print. You've been at war ever since — the kind of war that's half love.",
      costume: "A gown that upstages the hosts, which is the point. A signature brooch shaped like a bee.",
      secrets: [
        { id: "bianca-s1", text: "You are 'B' — Theo's blackmailer. You were with him on the terrace 6:05–6:20. Your extortion is his alibi, and his alibi is your confession.", category: "crimeWeb" },
        { id: "bianca-s2", text: "You came tonight intending to buy the estate the moment Vivienne's announcement tanked its value. Your banker is on speed dial.", category: "personal" },
      ],
      objectives: [
        { id: "bianca-o1", text: "Keep the blackmail hidden while keeping Theo from hanging for a murder you can disprove.", type: "protect", successCriteria: "Theo is cleared without your note being read aloud." },
        { id: "bianca-o2", text: "Position yourself to buy the estate before the night ends.", type: "broker", successCriteria: "Get one Rosewood to discuss selling." },
      ],
      relationships: [
        { characterId: "theo", publicLabel: "Old flame, fellow bon vivant", privateTruth: "Your cash cow. Annoyingly, you still like him." },
        { characterId: "margaux", publicLabel: "The competent Rosewood", privateTruth: "She approached YOUR banker about a quiet sale last month. She doesn't know you know." },
      ],
      voice: {
        sampleLines: [
          "\"Lovely party. I'd have used better candles, but lovely.\"",
          "\"Rosewood wines age well. Rosewood secrets, less so.\"",
          "\"At six o'clock? Darling, I was exactly where I needed to be.\"",
        ],
        tic: "Toasts people she's lying to.",
        howToPlayMe: "Own every room. You know two huge secrets — spend them like a gambler with house money.",
      },
      whatToKnow: [
        "From the terrace you can see the cellar stairs — and who used them around 6:10.",
        "You saw a woman in dark red descend toward the cellar while Theo counted your money.",
        "Margaux has been talking to the Caldwell Group. Your banker confirmed it.",
      ],
    },
    {
      id: "webb",
      name: "Marcus Webb",
      role: "The family lawyer",
      publicPersona:
        "Discreet, gray-suited, omnipresent. Has drafted every Rosewood contract for fifteen years and witnessed things he bills extra to forget.",
      privateSelf:
        "You leaked the new will's contents to Margaux this afternoon — for a fee, as always. You've also been skimming the family trust for years. The new will moved everything into an audited foundation. Vivienne's death tonight... helps you, and you hate how much it helps you.",
      connectionToVictim:
        "Client and tormentor. She knew exactly what you were and found you useful anyway. Lately she'd started asking pointed questions about the trust.",
      costume: "Gray suit, leather portfolio that never leaves your hand.",
      secrets: [
        { id: "webb-s1", text: "You sold the will's contents to Margaux this afternoon. If that surfaces, you handed the killer the motive.", category: "crimeWeb" },
        { id: "webb-s2", text: "You've embezzled from the family trust. The new will's foundation audit would have caught you within a month.", category: "crimeWeb" },
      ],
      objectives: [
        { id: "webb-o1", text: "Destroy or recover the will draft floating around tonight — your leak is traceable to it.", type: "obtain", successCriteria: "You hold the draft, or its source is never traced to you." },
        { id: "webb-o2", text: "Make sure the OLD will stands. The old will has no audit.", type: "broker", successCriteria: "By finale, the room believes the new will is invalid or lost." },
      ],
      relationships: [
        { characterId: "margaux", publicLabel: "The heir, your real client these days", privateTruth: "Your buyer. If she falls, you fall with her." },
        { characterId: "elena", publicLabel: "Estate staff", privateTruth: "You know what the will makes her. You've been wondering what that knowledge is worth — and to whom." },
      ],
      voice: {
        sampleLines: [
          "\"I can neither confirm nor deny, which, between us, means yes.\"",
          "\"The will? Wills are living documents. Well. Poor choice of words.\"",
          "\"My fees are scandalous because my discretion is priceless.\"",
        ],
        tic: "Snaps the portfolio clasp open and shut while thinking.",
        howToPlayMe: "Everyone's confidant, no one's friend. Sell information in both directions and try to outrun your own paper trail.",
      },
      whatToKnow: [
        "The new will names a biological heir, establishes a foundation, and demotes Margaux to staff.",
        "Vivienne kept the signed original somewhere on the estate — only the draft circulated.",
        "The trust accounts won't survive an audit. Anyone's audit.",
      ],
    },
    {
      id: "sasha",
      name: "Sasha Kim",
      role: "Celebrated chef catering the gala",
      publicPersona:
        "A rising-star chef whose tasting menu is the talk of the valley. Intense, precise, runs the kitchen like a ship's bridge.",
      privateSelf:
        "Twenty years ago Vivienne destroyed your parents' restaurant — bought the building, tripled the rent, installed her own bistro. They never recovered. You took this job to look her in the eye as an equal. Someone stole your moment — and one of your kitchen torches is missing, which looks bad.",
      connectionToVictim:
        "She ruined your family and never learned your surname. You've been preparing for tonight for a year.",
      costume: "Chef's whites, immaculate. A knife roll you visibly never let out of reach.",
      secrets: [
        { id: "sasha-s1", text: "Your parents' restaurant was destroyed by Vivienne. Your sous-chef knows you've talked about 'making her swallow an apology'.", category: "crimeWeb" },
        { id: "sasha-s2", text: "You were in the cellar at 5:50 PM — choosing pairing bottles, with the steward. You saw Margaux's car keys on the storeroom shelf. Why were they there?", category: "crimeWeb" },
      ],
      objectives: [
        { id: "sasha-o1", text: "Keep your history with Vivienne quiet — the motive writes itself.", type: "protect", successCriteria: "Your family's story stays out of the investigation." },
        { id: "sasha-o2", text: "Account for the missing kitchen torch before someone finds it somewhere incriminating.", type: "obtain", successCriteria: "You find or explain the torch." },
        { id: "sasha-o3", text: "Tell someone what you saw in the storeroom — to the right person, at the right price.", type: "extract", successCriteria: "Your storeroom sighting reaches the group before the finale." },
      ],
      relationships: [
        { characterId: "elena", publicLabel: "The manager who hired you", privateTruth: "The only Rosewood-adjacent person who's ever been straight with you." },
        { characterId: "hart", publicLabel: "A guest with dietary restrictions", privateTruth: "She complimented your parents' restaurant once, years ago. She remembers it. You almost cried." },
      ],
      voice: {
        sampleLines: [
          "\"The menu is a story. Tonight's final course was her favorite. Was.\"",
          "\"I run a clean kitchen. Cleaner than this family, certainly.\"",
          "\"I was plating at six. Forty covers. Ask any of my brigade.\"",
        ],
        tic: "Wipes already-clean surfaces when agitated.",
        howToPlayMe: "Professional fury. You wanted a reckoning, not a corpse — and you're furious someone robbed you of it.",
      },
      whatToKnow: [
        "Kitchen staff saw the service corridor all evening — nobody passed that way to the cellar.",
        "The only other route to the cellar is the terrace stairs, in full view of the terrace.",
        "Your brigade can alibi each other — and you — from 5:55 onward.",
      ],
    },
  ],

  evidence: [
    {
      id: "e-glass",
      title: "Vivienne's private reserve glass",
      type: "photo",
      content:
        "Close-up of the matriarch's engraved toast glass, found unbroken beside her. The dried residue at the bottom carries a sharp, bitter scent — like stale tobacco. Vivienne never smoked.",
      discoveryFraming: "Recovered from the cellar floor, inexplicably unbroken in a scene of 'accidental' chaos.",
      releaseBeat: 2,
      pointsTo: "The death was poisoning, not a barrel-rack accident. The poison was in her personal toast glass.",
    },
    {
      id: "e-exam",
      title: "Dr. Hart's preliminary examination",
      type: "testimony",
      content:
        "\"No bleeding beneath the rack. Lividity says she died between 6:00 and 6:30. The rack fell at 6:45 — three witnesses heard it. You don't bruise after you're dead, and she didn't. Someone arranged that rack like a stage set.\"",
      discoveryFraming: "Dr. Hart, pressed by the group, finally says what she's known for an hour.",
      releaseBeat: 2,
      pointsTo: "Time of death 6:00–6:30, before the staged collapse. Whoever toppled the rack at 6:45 was staging, not killing.",
    },
    {
      id: "e-will",
      title: "Draft of the new will",
      type: "document",
      content:
        "LAST WILL & TESTAMENT (DRAFT — M.W.) ... the Estate to be held by the ROSEWOOD FOUNDATION, audited annually ... acknowledging my daughter ELENA VASQUEZ ... Margaux Rosewood to serve as salaried Estate Director ... announcement to be made at midnight, on the occasion of the 50th anniversary.",
      discoveryFraming: "Found folded into the gala's master seating binder — where only an organizer would look.",
      releaseBeat: 3,
      pointsTo: "Motive: the new will disinherits Margaux, exposes the trust to audit (Webb), and names Elena. Three people's worlds end at midnight.",
    },
    {
      id: "e-keylog",
      title: "Storeroom key log",
      type: "document",
      content:
        "PESTICIDE CABINET — ACCESS LOG (auto-stamp): MAY 12, 17:02 — cabinet locked, E. Vasquez. MAY 12, 18:12 — cabinet OPENED, master key. MAY 12, 18:14 — cabinet closed. Note: nicotine sulfate concentrate, 1 bottle, seal broken (inventory check 18:50, E.V.).",
      discoveryFraming: "Pulled from the storeroom's old brass log-clock by someone who knew it existed.",
      releaseBeat: 4,
      pointsTo: "The poison cabinet was opened with a master key at 6:12 PM, inside the death window. Three master keys exist: Vivienne's, Elena's, Margaux's.",
    },
    {
      id: "e-fakes",
      title: "Six counterfeit reserve bottles",
      type: "physical",
      content:
        "Six bottles of '74 Rosewood Reserve from the back rack. The capsules are right; the glass is wrong — modern moulding. Whoever swapped these knew the cellar and needed money. The toppled rack was THIS rack.",
      discoveryFraming: "Found when the fallen rack was lifted — the collapse exposed the very bottles someone wanted hidden.",
      releaseBeat: 5,
      pointsTo: "Suspicion: Theo. The staged 'accident' targeted the counterfeit rack — was the collapse meant to bury this fraud?",
    },
    {
      id: "e-blackmail",
      title: "Blackmail note signed 'B'",
      type: "document",
      content:
        "\"Final consulting invoice. Terrace, 6:05, bring it all. Don't be late, sommelier — fakes age badly and so does my patience. — B\"",
      discoveryFraming: "Lifted from Theo's jacket during a staged toast — or surrendered by him under pressure.",
      releaseBeat: 6,
      pointsTo: "Theo was on the terrace 6:05–6:20 paying a blackmailer. His window for the cellar closes; the counterfeit motive cuts against murder — the fraud surfacing is the LAST thing he wanted.",
      falsifies: "The Theo theory: his secret made him look guilty; his blackmail meeting clears him.",
    },
    {
      id: "e-photo",
      title: "Photographer's 6:15 terrace shot",
      type: "photo",
      content:
        "Timestamped 18:15:22. The terrace in golden light: Theo, visibly sweating, with Bianca mid-toast; Dr. Hart by the rail; Sasha's brigade through the kitchen window; Julian writing in a notebook. Margaux — who told everyone she was 'greeting guests on the terrace until 6:30' — is nowhere in frame. The cellar stairs are at the frame's edge: a blur of wine-dark red descending.",
      discoveryFraming: "The gala photographer, asked for candids, scrolls back to golden hour.",
      releaseBeat: 6,
      pointsTo: "Margaux's stated alibi is false. A figure in wine-dark red was on the cellar stairs at 6:15.",
    },
    {
      id: "e-dna",
      title: "Vivienne's unsent letter to Elena",
      type: "document",
      content:
        "\"My Elena — you have been my daughter twice over: once by blood, which I hid, and once by choice, which I watched every day for twenty-two years. At midnight I stop hiding. Forgive me the order I did things in. — V.\"",
      discoveryFraming: "Found in Vivienne's evening bag, sealed, stamped, never delivered.",
      releaseBeat: 7,
      pointsTo: "Suspicion: Elena inherits everything and tended the poison cabinet. The strongest motive in the room belongs to the quietest person.",
    },
    {
      id: "e-keyreceipt",
      title: "Tasting-desk key receipt",
      type: "document",
      content:
        "ROSEWOOD ESTATE — KEY CHECK. Master key #2 (E. Vasquez) checked IN 17:40 by tasting steward; checked OUT 19:05 by E. Vasquez. Steward's initials, witnessed by two pourers.",
      discoveryFraming: "Produced by the tasting steward, who keeps receipts for everything.",
      releaseBeat: 7,
      pointsTo: "Elena's master key was locked at the tasting desk from 5:40 to 7:05 — she physically could not have opened the cabinet at 6:12. Vivienne's own key was on her body. One master key remains.",
      falsifies: "The Elena theory: motive without means. Her key was witnessed elsewhere.",
    },
    {
      id: "e-seating",
      title: "Seating chart on the will's back page",
      type: "document",
      content:
        "The gala's final seating chart, hand-drawn — in Margaux's unmistakable handwriting — on the BACK of page 3 of the will draft. She told the room she'd never seen the new will. She drafted tonight's seating on it.",
      discoveryFraming: "Noticed when the will draft is flipped over under better light.",
      releaseBeat: 7,
      pointsTo: "Margaux had the will draft in her hands before the gala — hours before the murder. She knew she'd been disinherited, and lied about knowing.",
    },
  ],

  beats: [
    {
      id: "b0", act: 1, title: "The Golden Hour",
      hostScript:
        "Welcome to Rosewood Estate's 50th-anniversary gala. Vivienne has just announced that 'at midnight, everything changes.' Mingle in character: you each have reasons to love and fear this family. The storm has closed the road — no one leaves tonight.",
      hostNotes: "Let introductions breathe for 10–15 minutes. Nudge quieter players using their first prompt.",
      prompts: [
        { characterId: "margaux", text: "Work the room like you own it — because by midnight, you might not. Find out what Webb has told anyone about the will." },
        { characterId: "theo", text: "You have an appointment at 6:05 you can't miss. Establish loudly, to anyone, that you'll be 'getting some air' soon." },
        { characterId: "elena", text: "Check your key ring habitually. Mention to someone that you checked your master key in at the tasting desk." },
        { characterId: "hart", text: "Watch Vivienne's glass. You promised her you'd watch everything tonight. Say cryptic things about 'midnight'." },
        { characterId: "julian", text: "Critique a wine using words you read on a plane. See who winces — that person knows wine, and might see through you." },
        { characterId: "bianca", text: "Compliment the estate in ways that are actually insults. Confirm Theo remembers your 6:05 appointment." },
        { characterId: "webb", text: "Someone may mention the will. Practice your 'attorney face'. Find out who else has seen any paperwork." },
        { characterId: "sasha", text: "Send out the first course. Mention pointedly that the menu 'honors the past' — see if Vivienne's children even notice." },
      ],
      releasesEvidence: [],
      skippable: false,
    },
    {
      id: "b1", act: 1, title: "The Cellar Falls Silent",
      hostScript:
        "A crash from below — then a scream. Vivienne Rosewood lies dead in the barrel cellar beneath a toppled rack, her private toast glass unbroken beside her. The road is closed; the law is hours away. The room must decide: accident... or something else?",
      hostNotes: "Read aloud with the lights briefly down if you can. Then release the first wave of doubt.",
      prompts: [
        { characterId: "hart", text: "Examine the body — in front of everyone. Don't share conclusions yet. Polish your glasses. Say 'hm' in a way that ruins the word 'accident' for everybody." },
        { characterId: "margaux", text: "Take charge: organize the room, comfort no one. Mention you were 'greeting guests on the terrace until 6:30' — say it twice, to different people." },
        { characterId: "sasha", text: "Your brigade saw the service corridor all evening. Volunteer that NO ONE used the kitchen route to the cellar." },
        { characterId: "julian", text: "Start a timeline. Publicly. Ask each guest, charmingly, where they were between 6:00 and 7:00." },
      ],
      releasesEvidence: [],
      skippable: false,
    },
    {
      id: "b2", act: 1, title: "The Unbroken Glass",
      hostScript:
        "The cellar tells two stories. A rack that fell at 6:45 — and a woman who, the doctor now admits, was dead before half past six. And then there's the glass: unbroken, and smelling of something no vineyard pours.",
      hostNotes: "ACT TURN — the accident becomes a murder. Release the glass photo and Hart's examination. Expect the room to get loud; let it.",
      prompts: [
        { characterId: "hart", text: "It's time. Tell the room what you found — the timeline, the absence of bleeding. Do NOT mention the medical records you falsified. If pressed on why you waited, deflect with grief." },
        { characterId: "elena", text: "That bitter smell means something to you — the old nicotine concentrate in your pesticide cabinet. You must decide: speak up (and point at your own storeroom), or check the cabinet first, quietly." },
        { characterId: "theo", text: "A murder investigation will dig up everything — including your cellar visits. Start quietly steering: 'Mother had enemies outside this room, you know.'" },
        { characterId: "bianca", text: "You know exactly who was where at 6:10 — you watched the cellar stairs from the terrace. Hold it. The price of your testimony just went up." },
      ],
      releasesEvidence: ["e-glass", "e-exam"],
      skippable: false,
    },
    {
      id: "b3", act: 2, title: "Midnight Comes Early",
      hostScript:
        "What was Vivienne going to announce at midnight? The question hangs over the room — until someone finds a draft of the answer folded into the seating binder. The will. The new will.",
      hostNotes: "Release the will draft. This redraws every motive in the room. Give players time to confront each other.",
      prompts: [
        { characterId: "webb", text: "That draft is YOUR draft — the one you sold. Get it back, discredit it ('drafts are not instruments, people'), or muddy who could have leaked it." },
        { characterId: "elena", text: "Your name is about to be read aloud. Decide NOW: claim your truth with pride, or deny everything. Either path is playable — choose the one that feels like Elena." },
        { characterId: "margaux", text: "React to your disinheritance as if hearing it for the FIRST time. You are good at composure. Be slightly too good at it." },
        { characterId: "julian", text: "Follow the paper: ask Webb, loudly, how many people saw this draft before tonight. Lawyers leak — you've built a career on it." },
      ],
      releasesEvidence: ["e-will"],
      skippable: false,
    },
    {
      id: "b4", act: 2, title: "Eighteen Twelve",
      hostScript:
        "The storeroom keeps its own diary: a brass log-clock that stamps every opening of the pesticide cabinet. Tonight's entry reads 18:12 — a master key, inside the murder window. Three master keys exist.",
      hostNotes: "Release the key log. The investigation now has a physical spine: poison, cabinet, three keys.",
      prompts: [
        { characterId: "elena", text: "Your cabinet, your poison, your key — except your key was at the tasting desk. SAY SO, and find the steward's receipt before someone finds the noose. (Objective: get a witness.)" },
        { characterId: "sasha", text: "You saw something in the storeroom at 5:50 — Margaux's car keys on the shelf. Time to spend that secret. Choose your buyer: Julian's investigation, or Webb's discretion?" },
        { characterId: "margaux", text: "Your key is in your evening bag. If anyone asks to see all three master keys, you need a reason yours can't be examined — or a moment alone to wipe it." },
        { characterId: "hart", text: "Nicotine sulfate confirmed. Quietly tell the most level-headed player what symptoms it causes — and that the toast was poured at 5:45, by family tradition... by Margaux. Let THEM say it." },
      ],
      releasesEvidence: ["e-keylog"],
      skippable: false,
    },
    {
      id: "b5", act: 2, title: "What the Rack Was Hiding",
      hostScript:
        "Lifting the fallen rack to move the barrels, the room finds what the 'accident' nearly buried forever: six bottles of '74 Reserve that are not '74, not Reserve, and not even good fakes. The crash wasn't just staged — it was aimed.",
      hostNotes: "Release the counterfeits. The herring peaks here: Theo looks finished. Let him sweat one full scene before the exoneration becomes available next beat.",
      prompts: [
        { characterId: "theo", text: "Everything points at you and you CANNOT explain where you were at 6:10 without admitting the blackmail. Squirm. Deflect. Decide what ruin you prefer: suspected murderer, or confessed fraud?" },
        { characterId: "bianca", text: "Watching Theo drown is delicious until you remember: if he's convicted, your 'consulting fees' die with him, and you become the woman who let an innocent man hang. Your move." },
        { characterId: "margaux", text: "This is the gift you staged the rack for. Fan the flames gently: 'I've covered his debts twice. I won't speculate about what he'd do for money.' Then look sad. (Objective 2 is in reach.)" },
        { characterId: "julian", text: "Something's off: why would Theo stage a collapse that EXPOSES his own fraud? Pull on that thread, publicly. The staging only makes sense if someone wanted it found." },
      ],
      releasesEvidence: ["e-fakes"],
      skippable: true,
    },
    {
      id: "b6", act: 3, title: "Golden Hour, Reexamined",
      hostScript:
        "Two pieces of paper change the night. A note signed 'B' that puts Theo on the terrace at 6:05 — and the photographer's 6:15 shot of that terrace, which shows everyone where they claimed to be. Everyone except the woman who said she never left it.",
      hostNotes: "ACT TURN — release the blackmail note and the photograph together. The Theo theory dies; the Margaux thread opens. Manage the energy: this is the episode's best scene.",
      prompts: [
        { characterId: "theo", text: "The note is out. Own it: yes, you were being bled, yes, the bottles are fake, yes, you were on the terrace at 6:05. You are a fraud and NOT a killer, and weirdly this is the most honest moment of your life. Play it." },
        { characterId: "bianca", text: "Confirm his alibi — on your terms. You watched the stairs: tell the room what you saw at 6:10. A figure in wine-dark red, going DOWN. You remember thinking the dress was familiar." },
        { characterId: "margaux", text: "The photo is a problem. You 'stepped inside for a headache pill', obviously. Keep it small, keep it boring. Do NOT let anyone connect it to the seating chart still missing from your binder. Find that chart." },
        { characterId: "webb", text: "Margaux is sinking and your leak is the anchor. If she's exposed, you're next. Offer the room a alternative theory — any theory. Elena's inheritance, perhaps. You know what the will says." },
      ],
      releasesEvidence: ["e-blackmail", "e-photo"],
      skippable: false,
    },
    {
      id: "b7", act: 3, title: "Two Letters",
      hostScript:
        "Vivienne's evening bag yields a sealed letter to Elena — blood, love, and an inheritance. For a moment, the quiet estate manager is the perfect suspect. Then the tasting steward produces a receipt, and the seating chart turns over, and the room runs out of other stories.",
      hostNotes: "Release the letter, the key receipt, AND the seating chart. The herring and its exoneration land in the same beat; the chart closes the loop on Margaux. Finale is next — tell players to ready accusations.",
      prompts: [
        { characterId: "elena", text: "The room knows. Read the letter aloud if you can bear to — your mother's only apology. Then point out, steel-calm, that your key was locked at the tasting desk while someone else's opened that cabinet. (You may finally say the word 'sister.')" },
        { characterId: "hart", text: "Vivienne died protecting that letter's promise. Time to spend your last secret: tell the room the toast glass was poured at 5:45, and BY WHOM. You watched it happen, like you promised her you would." },
        { characterId: "margaux", text: "The chart is out. Your handwriting, the will's back page, your 'first time seeing it' in ruins. You have one move left: the performance of your life. Confess nothing. Make them PROVE the key, the dress, the pour." },
        { characterId: "julian", text: "Assemble it for the room like the closing chapter you'll someday write: the will she'd already seen, the key only she still held, the pour only she could make, the photograph she isn't in." },
        { characterId: "sasha", text: "If your storeroom sighting hasn't surfaced yet, NOW: Margaux's car keys on the storeroom shelf at 5:50 — before the cabinet opened. The kitchen sees everything." },
      ],
      releasesEvidence: ["e-dna", "e-keyreceipt", "e-seating"],
      skippable: false,
    },
    {
      id: "b8", act: 3, title: "The Last Toast",
      hostScript:
        "The storm is passing; the road will open within the hour, and with it, the law. Before it arrives, this room will name its verdict. Raise a glass — carefully — and make your accusations: who killed Vivienne Rosewood, why, and how?",
      hostNotes: "FINALE — open accusations on every player's device. When all are in, play the reveal. Then run the dual-victory scoreboard and awards.",
      prompts: [
        { characterId: "margaux", text: "Final accusation time. If you've made it this far uncaught — accuse Elena, coldly, and dare the room to choose blood over proof." },
        { characterId: "theo", text: "Accuse with your whole ruined heart. You lost a mother and your reputation tonight; you might as well find the truth." },
        { characterId: "elena", text: "However the vote falls, you end the night a Rosewood. Decide what kind." },
        { characterId: "hart", text: "You promised Vivienne you'd watch. Make your accusation a eulogy." },
      ],
      releasesEvidence: [],
      skippable: false,
    },
  ],

  solution: {
    culpritId: "margaux",
    motive:
      "Disinheritance and the death of her sale. Margaux learned (via Webb's leak) that the midnight announcement would demote her to a salaried employee, name Elena as heir, and lock the estate into an audited foundation — killing her secret sale to the Caldwell Group. Twenty years of dutiful waiting were about to be worth nothing.",
    means:
      "Nicotine sulfate concentrate from the estate's pesticide cabinet, opened at 6:12 PM with her master key — the only one of the three not accounted for elsewhere. The dose went into Vivienne's private reserve toast glass, which family tradition has Margaux pour.",
    opportunity:
      "She slipped from the terrace during golden hour ('greeting guests') — absent from the photographer's 6:15 frame, glimpsed by Bianca descending the cellar stairs in wine-dark red at 6:10.",
    staging:
      "At 6:45 she toppled the inspected, sound barrel rack onto the body to stage an accident — deliberately choosing the rack that hid Theo's counterfeits, aiming the investigation at her brother's fraud.",
    intendedMisread:
      "A tragic cellar accident; failing that, Theo — the debtor with cellar access and a fraud to bury.",
    revealNarration:
      "It was the daughter who smiled all evening. Margaux Rosewood poured her mother's last toast at a quarter to six — the same hands that had poured it for twenty years, steady as ever, while the storeroom's brass clock quietly wrote down her alibi's obituary: eighteen-twelve, master key, two minutes. She watched her mother drink to fifty years of Rosewood Estate, and then she went back to greeting guests — except the camera says she didn't, and the stairs say she didn't, and the seating chart in her own handwriting, drawn on the back of the will that ruined her, says she knew exactly what midnight would cost. The rack was for Theo: one last sisterly gift, a fraud to feed the wolves. She thought grief would look like innocence. But grief doesn't check its watch.",
  },

  hintLadder: [
    "Nobody poisons a stranger's glass. Whose hands touched that toast?",
    "Three master keys. Two are accounted for in writing. Walk the third one home.",
    "Look again at the 6:15 photograph — not at who's in it. At who isn't.",
  ],

  awards: [
    { title: "The One Who Knew All Along", criteria: "Correct culprit AND correct motive in the final accusation." },
    { title: "Best Performance", criteria: "Voted by the table for staying most in character." },
    { title: "Most Devious", criteria: "Most personal objectives completed while evading suspicion." },
    { title: "The Bloodhound", criteria: "First player to publicly connect the key log to the master keys." },
    { title: "Heart of the Estate", criteria: "The player whose roleplay moment the table will retell for years." },
  ],
};
