// The event landing pages (/haldi-invitation-video and friends).
// Each page answers one search: what to put on that event's invite, wording to copy, and a one-tap
// start in the editor with a design made for that event. Written to be read by people first:
// short sentences, real examples, no filler. Facts here are checked against the tool itself.

import type { EventId } from "../types";

export type Faq = { q: string; a: string };
export type Wording = { label: string; text: string };

export type EventPage = {
  slug: string;
  event: EventId;
  name: string; // "Haldi"
  categories: string[]; // design library sections shown on the page, best first
  title: string; // the <title>, keyword first (under 60 characters)
  description: string; // the search result snippet (under 155 characters)
  h1: string;
  lead: string; // what this page gives you, in one or two sentences
  question: string; // the reader's main question, as they'd type it (first H2)
  answer: string; // a direct answer in under 100 words
  include: string[]; // what to put on the invite
  wording: Wording[];
  whatsapp: string; // the message to send along with the video
  dress: string[]; // dress code lines people use
  timing: string;
  motions: string[]; // suggested animations (names as shown in the editor)
  faqs: Faq[];
};

export const EVENT_PAGES: EventPage[] = [
  {
    slug: "haldi-invitation-video",
    event: "haldi",
    name: "Haldi",
    categories: ["haldi", "marigold", "florals"],
    title: "Haldi Invitation Video Maker (Free, No Watermark)",
    description:
      "Make a Haldi ceremony invitation video on your phone in minutes. Yellow and marigold designs, ready wording, music included. Free, no watermark, no sign-up.",
    h1: "Haldi invitation video maker",
    lead: "Make a Haldi ceremony invite for WhatsApp in a few minutes: pick a yellow or marigold design, copy one of the wordings below, and download the video.",
    question: "How do I make a Haldi invitation video for free?",
    answer:
      "Open the Haldi design on this page, type the bride's or groom's name, the date, time and venue, and press Export. The video is made on your phone (nothing is uploaded) and saved as an MP4 you can send on WhatsApp or post as an Instagram story. There's no watermark and no account. If the Haldi is one part of a bigger celebration, add a page for each event and send one video for everything.",
    include: [
      "Whose Haldi it is: “Haldi ceremony of Aishwarya” or both names for a joint Haldi",
      "Date and start time (Haldi is usually in the morning or early afternoon)",
      "Venue, with the lawn or hall name if the venue has more than one",
      "Dress code: yellow is the classic choice, and guests like to know if white is welcome",
      "A note to wear clothes they don't mind getting turmeric on",
      "Who to call for directions or RSVP",
    ],
    wording: [
      {
        label: "Simple and warm",
        text: "Join us as we smear a little haldi and a lot of love\nat the Haldi ceremony of\nAishwarya\nSaturday, 11th December 2026, 10:30 AM onwards\nPoolside Lawns, The Leela Palace, Udaipur",
      },
      {
        label: "From the family",
        text: "The Iyer family invites you to the Haldi ceremony of our daughter\nAishwarya\nOn 11th December 2026 at 10:30 AM\nat our home, 14 Lake Road, Udaipur\nDress code: shades of yellow",
      },
      {
        label: "Fun",
        text: "Things are about to get yellow!\nCome get messy with us at\nRohan's Haldi\n11th December, 10:30 AM\nWear something you don't love too much",
      },
      {
        label: "Joint Haldi",
        text: "Two families, one turmeric bowl\nHaldi of Rohan & Aishwarya\nOn 11th December 2026, 11 AM onwards\nGarden Courtyard, Udaipur\nYellow outfits, big smiles",
      },
      {
        label: "Hinglish",
        text: "Haldi lagao, rang jamao!\nAishwarya ki Haldi mein zaroor aana\n11 December, subah 10:30 baje\nPoolside Lawns, Udaipur",
      },
    ],
    whatsapp:
      "Namaste! We'd love to have you at Aishwarya's Haldi on 11th December, 10:30 AM at Poolside Lawns, Udaipur. The invite video is attached. Do wear yellow!",
    dress: ["Shades of yellow", "Yellow and white", "Florals and pastels", "Wear something turmeric-friendly"],
    timing:
      "Send Haldi invites with the main wedding invite, usually three to five weeks before. A short reminder the day before helps, because Haldi often starts early in the morning.",
    motions: ["Marigold garlands", "Rose petals", "Kalash blessing", "Butterflies", "Parrots", "Golden sparkles"],
    faqs: [
      {
        q: "Can I make only a Haldi invite, without the wedding pages?",
        a: "Yes. Start from the Haldi design and delete the other pages, or keep a single page and download it as a picture (PNG) instead of a video.",
      },
      {
        q: "What colours work best for a Haldi invite?",
        a: "Yellow, marigold orange and soft green are traditional because of the turmeric. The Haldi designs here use them already, and you can change the paper colour in one tap if your theme is different.",
      },
      {
        q: "Can I write the invite in Hindi?",
        a: "Yes. Type in Hindi (or any language) and pick a font with Devanagari letters, such as Yatra One, Rozha One or Amita.",
      },
      {
        q: "Is the music copyright-free?",
        a: "Yes. The music in the tool is original, composed in code for this tool, so it won't be muted or flagged on Instagram or WhatsApp.",
      },
    ],
  },
  {
    slug: "mehendi-invitation-video",
    event: "mehendi",
    name: "Mehendi",
    categories: ["mehendi", "paisley", "birds"],
    title: "Mehendi Invitation Video Maker (Free, No Watermark)",
    description:
      "Make a Mehendi ceremony invitation video in minutes. Green, paisley and henna designs, ready wording, music included. Free, no watermark, no sign-up.",
    h1: "Mehendi invitation video maker",
    lead: "Make a Mehendi invite for WhatsApp in a few minutes: pick a green or paisley design, copy a wording below, and download the video.",
    question: "How do I make a Mehendi invitation video for free?",
    answer:
      "Open a Mehendi design on this page, add the bride's name, the date, time and venue, and press Export. You get an MP4 made right on your phone, with no watermark and no account. Add music and an animation such as the Mehendi pattern or parrots, and you're done. To invite people to every function at once, add a page per event and send one video.",
    include: [
      "Whose Mehendi it is (usually the bride's)",
      "Date and time (afternoon or evening is most common)",
      "Venue, with the exact lawn, terrace or home address",
      "Dress code: greens, florals or bright colours",
      "Whether there's a dholki, games or a performance, so guests come ready",
      "A contact number for directions",
    ],
    wording: [
      {
        label: "Simple and warm",
        text: "Henna, music and lots of love\nJoin us for the Mehendi ceremony of\nAishwarya\nOn 11th December 2026, 4:00 PM onwards\nGarden Courtyard, The Leela Palace, Udaipur",
      },
      {
        label: "From the family",
        text: "With joy, the Iyer family invites you\nto the Mehendi of our daughter\nAishwarya\nThursday, 11th December 2026 at 4 PM\nat our residence, Udaipur\nDress code: shades of green",
      },
      {
        label: "Fun",
        text: "Hands out, hearts open!\nCome for the mehendi, stay for the dance\nAishwarya's Mehendi\n11th December, 4 PM till late",
      },
      {
        label: "Mehendi and Sangeet together",
        text: "An evening of mehendi, music and dance\nMehendi & Sangeet of\nRohan & Aishwarya\n11th December 2026, 5 PM onwards\nDurbar Hall, Udaipur",
      },
      {
        label: "Hinglish",
        text: "Mehendi lagaane aa jaana!\nAishwarya ki Mehendi\n11 December, shaam 4 baje\nGarden Courtyard, Udaipur",
      },
    ],
    whatsapp:
      "Hello! Aishwarya's Mehendi is on 11th December at 4 PM at the Garden Courtyard, Udaipur. The invite video is attached. Come early if you'd like your mehendi done too!",
    dress: ["Shades of green", "Florals", "Bright and colourful", "Pastels"],
    timing:
      "Send it with the wedding invite, three to five weeks ahead. If mehendi artists will do guests' hands, mention it so people can plan their day.",
    motions: ["Mehendi", "Parrots", "Butterflies", "Marigold garlands", "Rose petals", "Peacock dance"],
    faqs: [
      {
        q: "Can I combine the Mehendi and Sangeet in one invite?",
        a: "Yes. Either write both on one page (see the combined wording above) or add a page for each event so every function gets its own design.",
      },
      {
        q: "Which design suits a Mehendi invite?",
        a: "Greens, paisleys and birds fit the mood. The Mehendi section of the design library has designs made for it, and you can recolour the paper in one tap.",
      },
      {
        q: "How long should a Mehendi invite video be?",
        a: "One event page plays for about 4 to 6 seconds, which is enough to read. A full invite with every event is usually 30 to 45 seconds.",
      },
      {
        q: "Do I need to sign up?",
        a: "No. Everything runs in your browser and your invite is saved on your own phone, so you can come back and finish it later.",
      },
    ],
  },
  {
    slug: "sangeet-invitation-video",
    event: "sangeet",
    name: "Sangeet",
    categories: ["sangeet", "lights", "peacocks"],
    title: "Sangeet Invitation Video Maker (Free, No Watermark)",
    description:
      "Make a Sangeet night invitation video in minutes. Glamorous designs, ready wording, music and lantern animations. Free, no watermark, no sign-up.",
    h1: "Sangeet invitation video maker",
    lead: "Make a Sangeet invite for WhatsApp in a few minutes: pick a night-time design, copy a wording below, and download the video.",
    question: "How do I make a Sangeet invitation video for free?",
    answer:
      "Open a Sangeet design on this page, type the couple's names, the date, time and venue, and press Export. The video is made on your phone, with no watermark and no sign-up. Lantern, sparkle and peacock animations suit a Sangeet. If you're inviting people to the whole wedding, add a page for each event and send one video.",
    include: [
      "Both names (the Sangeet usually brings both families together)",
      "Date and time (evenings, often 7 or 8 PM onwards)",
      "Venue and the hall name",
      "Dress code: glitter and glam, Indo-western, or a colour theme",
      "If guests are performing, a line asking them to bring their dancing shoes",
      "Cocktails or dinner details, if any",
    ],
    wording: [
      {
        label: "Glamorous",
        text: "An evening of music, dance and celebration\nSangeet night of\nRohan & Aishwarya\nOn 11th December 2026, 8:00 PM onwards\nDurbar Hall, The Leela Palace, Udaipur\nDress code: glitter & glam",
      },
      {
        label: "From the family",
        text: "The Sharma and Iyer families invite you\nto the Sangeet of\nRohan & Aishwarya\nThursday, 11th December 2026, 8 PM\nDurbar Hall, Udaipur",
      },
      {
        label: "Fun",
        text: "Warm up those dance moves!\nRohan & Aishwarya's Sangeet\n11th December, 8 PM till we drop\nDurbar Hall, Udaipur",
      },
      {
        label: "Cocktail Sangeet",
        text: "Music, dance and cocktails\nSangeet & Cocktail night\nRohan & Aishwarya\n11th December 2026, 8 PM onwards\nThe Terrace, Udaipur",
      },
      {
        label: "Hinglish",
        text: "Dhol bajega, sab nachenge!\nRohan aur Aishwarya ka Sangeet\n11 December, raat 8 baje\nDurbar Hall, Udaipur",
      },
    ],
    whatsapp:
      "Hi! You're invited to Rohan & Aishwarya's Sangeet on 11th December, 8 PM at Durbar Hall, Udaipur. Invite video attached. Dress code is glitter & glam, and dancing is compulsory!",
    dress: ["Glitter & glam", "Indo-western", "Black and gold", "Jewel tones"],
    timing:
      "Send it three to five weeks ahead, with the wedding invite. If family members are preparing dances, tell them earlier, at least six to eight weeks before.",
    motions: ["Swinging lanterns", "Golden sparkles", "Peacock dance", "Sky lanterns", "Diya lights", "Rose petals"],
    faqs: [
      {
        q: "What should a Sangeet invite say?",
        a: "Both names, the date and time, the venue and a dress code. A fun line about dancing sets the mood; see the wordings above.",
      },
      {
        q: "Can I use a dark or night-time design?",
        a: "Yes. The Sangeet section has deep purple and night designs, and text colours adjust so it stays readable.",
      },
      {
        q: "Will the video work as an Instagram story?",
        a: "Yes. Videos are 9:16 (720 × 1280), the size of a phone screen, so they fit WhatsApp status and Instagram stories without cropping.",
      },
      {
        q: "Can I add our own photo?",
        a: "Not yet. The designs are illustrated, in the style of printed cards. Photo support is on the list.",
      },
    ],
  },
  {
    slug: "reception-invitation-video",
    event: "reception",
    name: "Reception",
    categories: ["reception", "minimal", "palaces"],
    title: "Wedding Reception Invitation Video Maker (Free)",
    description:
      "Make a wedding reception invitation video in minutes. Elegant navy, gold and palace designs with ready wording and music. Free, no watermark, no sign-up.",
    h1: "Reception invitation video maker",
    lead: "Make a wedding reception invite for WhatsApp in a few minutes: pick an elegant design, copy a wording below, and download the video.",
    question: "How do I make a reception invitation video for free?",
    answer:
      "Open a reception design on this page, type the couple's names, the hosts, the date, time and venue, and press Export. You get an MP4 made on your phone, with no watermark and no account. Elegant animations like sky lanterns or diya lights suit a reception. Send it on its own, or add it as the last page of the full wedding invite.",
    include: [
      "The couple's names (now married, so “Mr & Mrs” wording works too)",
      "Who is hosting, often the groom's family",
      "Date and time (usually the evening after the wedding)",
      "Venue and hall",
      "Dress code: formal, Indo-western or a colour",
      "RSVP contact, since receptions often have a seated dinner",
    ],
    wording: [
      {
        label: "Elegant",
        text: "Please join us for the wedding reception of\nRohan & Aishwarya\nOn 13th December 2026, 8:00 PM onwards\nGrand Ballroom, The Leela Palace, Udaipur\nDinner to follow",
      },
      {
        label: "Hosted by parents",
        text: "Mr. Anil & Mrs. Sunita Sharma\nrequest the pleasure of your company\nat the reception of their son\nRohan\nwith\nAishwarya\nSaturday, 13th December 2026, 8 PM\nGrand Ballroom, Udaipur",
      },
      {
        label: "Mr & Mrs",
        text: "Celebrate the new Mr & Mrs\nRohan & Aishwarya\nReception: 13th December, 8 PM onwards\nGrand Ballroom, Udaipur",
      },
      {
        label: "After a small wedding",
        text: "We tied the knot with our families close.\nNow we'd love to celebrate with you.\nReception of Rohan & Aishwarya\n13th December 2026, 8 PM\nGrand Ballroom, Udaipur",
      },
      {
        label: "Hinglish",
        text: "Aapki upasthiti hamare liye aashirwad hogi\nRohan aur Aishwarya ka Reception\n13 December, raat 8 baje\nGrand Ballroom, Udaipur",
      },
    ],
    whatsapp:
      "Namaste! We'd be honoured to have you at Rohan & Aishwarya's reception on 13th December, 8 PM at the Grand Ballroom, Udaipur. The invite video is attached. Kindly let us know if you can make it.",
    dress: ["Formal", "Indo-western", "Black tie", "Pastels"],
    timing:
      "Send it with the wedding invite, three to five weeks ahead. If the reception is in another city, send it earlier so guests can plan travel.",
    motions: ["Sky lanterns", "Diya lights", "Golden sparkles", "Palace doors", "Rose petals", "Swinging lanterns"],
    faqs: [
      {
        q: "Who should host a reception invite?",
        a: "Traditionally the groom's parents host the reception, but the couple can host it too. Both wordings are above.",
      },
      {
        q: "Can I send a reception invite on its own?",
        a: "Yes. Make a one-page invite and download it as a video or a picture. Many families send it separately to colleagues and friends.",
      },
      {
        q: "What designs suit a reception?",
        a: "Navy and gold, minimal designs and palace arches feel formal. Pick one from the Reception or Minimal & gold sections.",
      },
      {
        q: "Is there a watermark on the video?",
        a: "No. The video is yours, clean, with nothing added.",
      },
    ],
  },
];

export const eventPage = (slug: string) => EVENT_PAGES.find((p) => p.slug === slug);
