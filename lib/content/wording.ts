// The wedding invitation wording collection (/wedding-invitation-wording).
// Grouped by who is inviting and where the words go, so people can find "invite from the bride's
// parents" or "RSVP line" in one glance. Event-specific wording lives on each event page.

import type { Faq, Wording } from "./events";

export type WordingGroup = { id: string; title: string; intro: string; items: Wording[] };

export const WORDING_GROUPS: WordingGroup[] = [
  {
    id: "traditional",
    title: "Traditional Hindu wedding invitation wording",
    intro: "Formal wording in the style of printed cards, opening with the blessings of the elders or of Ganesh ji.",
    items: [
      {
        label: "With the blessings of the elders",
        text: "With the blessings of the elders,\nwe cordially invite you to the wedding of\nRohan\n(S/o Mr. Anil & Mrs. Sunita Sharma)\nwith\nAishwarya\n(D/o Mr. Ravi & Mrs. Lakshmi Iyer)\nOn Saturday, 12th December 2026\nat The Leela Palace, Udaipur",
      },
      {
        label: "With Ganesh ji's blessings",
        text: "Shri Ganeshaya Namah\nWith the divine blessings of Lord Ganesha,\nwe request the pleasure of your company\nat the auspicious wedding of\nRohan & Aishwarya\nOn 12th December 2026, 7 PM onwards",
      },
      {
        label: "Ganesh shloka opening",
        text: "Vakratunda Mahakaya Suryakoti Samaprabha\nNirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvada\n\nWe invite you to bless the couple\nRohan & Aishwarya\nOn 12th December 2026",
      },
      {
        label: "Auspicious occasion",
        text: "On the auspicious occasion of the marriage of\nRohan\nwith\nAishwarya\nwe solicit your gracious presence\nand blessings for the couple\n12th December 2026, Udaipur",
      },
    ],
  },
  {
    id: "parents",
    title: "Wedding invitation wording from parents",
    intro: "When the bride's or groom's parents are inviting. Put the hosting family's names first.",
    items: [
      {
        label: "From the bride's parents",
        text: "Mr. Ravi & Mrs. Lakshmi Iyer\nrequest the honour of your presence\nat the marriage of their daughter\nAishwarya\nwith\nRohan\n(S/o Mr. Anil & Mrs. Sunita Sharma)\nOn 12th December 2026 at 7 PM\nThe Leela Palace, Udaipur",
      },
      {
        label: "From the groom's parents",
        text: "Mr. Anil & Mrs. Sunita Sharma\ncordially invite you to grace the wedding of their son\nRohan\nwith\nAishwarya\n(D/o Mr. Ravi & Mrs. Lakshmi Iyer)\nOn 12th December 2026\nThe Leela Palace, Udaipur",
      },
      {
        label: "From both families",
        text: "Together with their families,\nthe Sharmas and the Iyers\ninvite you to celebrate the wedding of\nRohan & Aishwarya\n12th December 2026, Udaipur",
      },
      {
        label: "From grandparents",
        text: "With the blessings of\nSmt. Kamla Devi & Late Shri Ram Prasad Sharma\nwe invite you to the wedding of our grandson\nRohan\nwith\nAishwarya\nOn 12th December 2026",
      },
    ],
  },
  {
    id: "couple",
    title: "Modern wording from the couple",
    intro: "Friendly wording when the couple is inviting, good for friends and colleagues.",
    items: [
      {
        label: "Warm and simple",
        text: "We're getting married!\nRohan & Aishwarya\nwould love you to be there\nas we begin our forever\n12th December 2026, Udaipur",
      },
      {
        label: "Love story",
        text: "From college friends to forever\nRohan & Aishwarya\ninvite you to celebrate their wedding\n12th December 2026\nThe Leela Palace, Udaipur",
      },
      {
        label: "Short and sweet",
        text: "Two hearts, one journey\nRohan & Aishwarya\n12.12.2026 · Udaipur\nSave the date",
      },
      {
        label: "For colleagues",
        text: "We'd be delighted if you could join us\nfor our wedding celebrations\nRohan & Aishwarya\nReception: 13th December 2026, 8 PM\nGrand Ballroom, Udaipur",
      },
    ],
  },
  {
    id: "hindi",
    title: "Hindi wedding invitation wording",
    intro: "Common lines from Hindi wedding cards. Pick a Devanagari font (Yatra One, Rozha One or Amita) in the editor.",
    items: [
      {
        label: "Opening",
        text: "॥ श्री गणेशाय नमः ॥\nशुभ विवाह",
      },
      {
        label: "Invitation",
        text: "सादर आमंत्रण\nआपकी गरिमामयी उपस्थिति प्रार्थनीय है\nचि. रोहन\nसंग\nआयु. ऐश्वर्या\nदिनांक: 12 दिसंबर 2026",
      },
      {
        label: "Closing",
        text: "दर्शनाभिलाषी: समस्त शर्मा परिवार\nस्वागतोत्सुक: समस्त इष्ट मित्र एवं परिजन",
      },
    ],
  },
  {
    id: "rsvp",
    title: "RSVP and closing lines",
    intro: "The small print at the end of the invite.",
    items: [
      { label: "RSVP", text: "RSVP: Rohan Sharma, +91 98765 43210\nKindly confirm by 25th November" },
      { label: "Blessings", text: "Your presence and blessings\nare all we ask for" },
      { label: "No gifts", text: "Your blessings are our gift.\nKindly no boxed gifts." },
      { label: "Best compliments", text: "With best compliments from\nAll friends and family" },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp message to send with your invite video",
    intro: "A short, personal message makes the forward feel like an invite, not spam.",
    items: [
      {
        label: "Family",
        text: "Namaste Chachaji and Chachiji! With great joy we invite you to Rohan and Aishwarya's wedding on 12th December in Udaipur. The invite video is attached. Your blessings mean the world to us.",
      },
      {
        label: "Friends",
        text: "It's happening! Rohan & Aishwarya are getting married on 12th December in Udaipur, and we want you there. Full details in the video. Block your dates!",
      },
      {
        label: "Colleagues",
        text: "Hi! I'm getting married on 12th December and would be glad if you could join us at the reception on the 13th, 8 PM, Grand Ballroom, Udaipur. Invite attached.",
      },
      {
        label: "Reminder",
        text: "Just a gentle reminder: we look forward to seeing you tomorrow at Rohan & Aishwarya's wedding, 7 PM at The Leela Palace. Location pin below.",
      },
    ],
  },
];

export const WORDING_FAQS: Faq[] = [
  {
    q: "What is the correct order of names on an Indian wedding invitation?",
    a: "The hosting family's child usually comes first. On an invite from the bride's parents, the bride's name comes first; from the groom's parents, the groom's. When both families host, either order is fine.",
  },
  {
    q: "What do S/o and D/o mean on a wedding card?",
    a: "S/o means “son of” and D/o means “daughter of”. They're written under the couple's names, with the parents' names in brackets.",
  },
  {
    q: "What do Chi., Ayu. and Sau. Ka. mean on Hindi cards?",
    a: "Chi. (चि., Chiranjeev) is written before the groom's name. Ayu. (आयु., Ayushmati) or Sau. Ka. (सौ. कां., Saubhagyakankshini) is written before the bride's. They're blessings for a long and happy life.",
  },
  {
    q: "How far in advance should we send wedding invitations?",
    a: "Most families send the main invite three to six weeks before the wedding, and a save-the-date two to six months ahead for destination weddings. A short WhatsApp reminder a day or two before helps.",
  },
  {
    q: "Is it okay to invite people on WhatsApp?",
    a: "Yes, for most guests it's now normal. Send a personal message with the video rather than a bare forward, and call elders or close family as well.",
  },
];
