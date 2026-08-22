/**
 * Prewritten messages for people who freeze at an empty box.
 *
 * The blank textarea is the hardest moment in the whole flow — someone opens
 * it fully intending to write something and finds they cannot start. These
 * are starting points, not finished cards: each one leaves an obvious place
 * to add the detail only they know.
 *
 * Deliberately not greeting-card language. "Wishing you happiness and
 * prosperity" is the sort of thing nobody has ever said out loud to a
 * sibling, and a wish that reads like a Hallmark box defeats the point.
 *
 * `{to}` and `{from}` are filled in with the real names before insertion.
 */
export interface MessageGroup {
  label: string;
  hint: string;
  messages: string[];
}

export const MESSAGE_GROUPS: MessageGroup[] = [
  {
    label: "From far away",
    hint: "When you cannot be there this year",
    messages: [
      "Every year you tie this thread and tell me it is just tradition.\nIt has never once been just tradition.\nI am sorry I am not there again this year.",
      "The distance is the only thing that changed.\nNothing else did.\nHappy Raksha Bandhan, {to}.",
      "I will not be at the table this year.\nSave me something, and do not let anyone take my seat.",
      "Some years the thread has to travel.\nThis one is coming the long way, but it is coming.",
    ],
  },
  {
    label: "Heartfelt",
    hint: "The things you never quite say",
    messages: [
      "You were the first person who was properly mine.\nYou are still the easiest to find.",
      "I do not say this often, so read it twice.\nI am glad it was you.",
      "Thank you for the years you covered for me.\nI have not forgotten a single one.",
      "Everyone else arrives and leaves.\nYou were simply always here.",
      "We have been through worse than a bad year.\nWe have the photographs to prove it.",
    ],
  },
  {
    label: "Hindi",
    hint: "अपनी भाषा में",
    messages: [
      "हर साल तुम यह धागा बांधती हो।\nहर साल मैं कुछ कहना भूल जाता हूँ।\nइस बार लिख दिया।",
      "दूरी सिर्फ़ दूरी है।\nबाक़ी सब वैसा ही है।\nरक्षा बंधन मुबारक, {to}।",
      "तुम्हारे बिना घर, घर नहीं लगता।\nजल्दी मिलते हैं।",
      "बहुत कुछ बदल गया।\nतुम नहीं बदले। शुक्रिया।",
    ],
  },
  {
    label: "Hinglish",
    hint: "Jaise hum actually baat karte hain",
    messages: [
      "Har saal socha ki bol dunga.\nHar saal reh gaya.\nIs baar likh diya — thank you, sach mein.",
      "Ghar se door hoon, par tumse nahi.\nHappy Rakhi, {to}.",
      "Tum abhi bhi meri sabse purani aadat ho.\nAur sabse achhi.",
      "Ladte rahenge. Har saal. Hamesha.\nAur har saal yeh dhaaga bhi bandhega.",
    ],
  },
  {
    label: "Light",
    hint: "For siblings who do not do sincere",
    messages: [
      "This is the one message a year where I am nice to you.\nScreenshot it. It expires.",
      "You are annoying, expensive, and impossible to shop for.\nAlso the only one I would pick.",
      "Congratulations on another year of being tolerated.\nHappy Raksha Bandhan.",
      "I looked for a card. Then I remembered you never read them.\nSo: thank you. That is the whole card.",
    ],
  },
];

/** Puts the real names into a template before it goes in the box. */
export function fillMessage(template: string, to: string, from: string): string {
  return template
    .replaceAll("{to}", to.trim() || "you")
    .replaceAll("{from}", from.trim() || "me");
}
