// ─────────────────────────────────────────────────────────────────────────────
// Content library, recovered from the original intelligentembodiment.com
// WordPress site (posts, pages, recipes, videos, testimonials).
// Edit freely; every page reads from here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Recipes (Ayurvedic kitchen, shown in Health Coaching) ──────────────────
export type Recipe = {
  slug: string;
  title: string;
  tag: string;
  image?: string;
  intro: string[];
  meta?: { servings?: string; servingSize?: string; prepTime?: string };
  ingredients?: string[];
  directions?: string[];
  benefits?: string[];
  note?: string;
};

export const recipes: Recipe[] = [
  {
    slug: "kitchari",
    title: "Kitchari",
    tag: "Nourishing one-pot cleanse",
    image: "/imagery/kitchari.jpg",
    intro: [
      "An Ayurvedic soup of split mung beans, basmati rice, and warming spices, designed to nourish and heal. The most-loved recipe on this site.",
      "Keep the vibe high when you cook. Sing, repeat a mantra, or play nice music.",
    ],
    ingredients: [
      "3/4 cup split yellow mung beans",
      "3/4 cup white basmati rice",
      "1 Tbs fresh ginger root",
      "1 tsp each: black mustard seeds, cumin seed, turmeric powder",
      "1/2 tsp each: coriander powder, coriander seed, fennel and fenugreek seeds (fenugreek optional, if you only have coriander powder, just use that, no worries!)",
      "3 cloves",
      "2 bay leaves",
      "1–2 small pieces of kelp or kombu, ripped up or cut with scissors (leave out if hard to find)",
      "7–10 cups water",
      "1/2 tsp salt (rock salt is best)",
      "1 small handful fresh chopped cilantro leaves",
      "1 Tbs ghee or coconut oil",
    ],
    directions: [
      "Wash split yellow mung beans and rice together until the water runs clear.",
      "Heat a large pot on medium heat, add 1 Tbs ghee, then add all the spices except the bay leaves. (For an extra step, dry-roast the spices for a minute or two before adding the ghee, it enhances the flavor but isn't necessary.) Cook the spices in ghee until you smell them, about 1–3 minutes.",
      "Add mung beans and rice and stir.",
      "Add veggies, an easy combo is 2 cups squash, carrot, or sweet potato with 1–1/2 cups kale or another green. Play with variations, but keep the balance of an augmenting (nourishing) veg with a tonifying (cleansing) veg.",
      "Add water, kelp or kombu, and bay leaves, and bring to a boil.",
      "Boil for 10 minutes.",
      "Turn heat to low, cover, and continue to cook until the mung beans and rice become soft, about 30–40 minutes.",
      "Add cilantro leaves just before serving.",
      "Salt to taste, enjoy!",
    ],
  },
  {
    slug: "agni-nectar",
    title: "Agni Nectar",
    tag: "Digestive tonic",
    image: "/imagery/AgniHoney-1.jpg",
    intro: [
      "A gentle, comforting digestive tonic made from lemon, honey, and fresh ginger, crafted to help keep your natural digestive fire steady and strong.",
      "Many find that a small sip before meals brings a sense of balance and ease, especially as the body's rhythms change with age. Warmth, brightness, and support from simple, familiar ingredients, a soothing daily ritual for anyone who wants to care for their digestion in a natural, nurturing way.",
    ],
    meta: { servings: "10–12", servingSize: "1 oz", prepTime: "15 minutes" },
    ingredients: [
      "1/2 cup fresh squeezed lemon juice",
      "1/2 cup raw honey",
      "1/4 cup freshly chopped ginger (no need to peel)",
      "1/4 cup water",
    ],
    directions: [
      "Mix the lemon juice and honey together in a jar or a small bowl with a lid.",
      "In a blender or food processor, pulse ginger and water into a fine pulp.",
      "Strain the ginger juice through a fine mesh strainer into the honey-lemon mixture. Mix well.",
      "Take 1 ounce before meals as a digestive aid.",
    ],
  },
  {
    slug: "ghee-soaked-dates",
    title: "Ghee-Soaked Dates",
    tag: "Rejuvenating rasayana",
    intro: [
      "Dates have been considered an energy-giving food by many cultures. In this Ayurvedic recipe, dates are combined with ghee, saffron, cardamom, cinnamon, and ginger.",
      "Rich and sweet, they nourish and revitalize your deepest tissues. This mixture is a classic rasayana, a tonic for rejuvenation (and an ancient love potion!). It is said to strengthen immunity as well as aid digestion. I love these little nuggets for building vitality in an easy and yummy way.",
    ],
    ingredients: [
      "Whole dates, pitted",
      "Ghee, enough to soak",
      "A pinch each of saffron, cardamom, cinnamon, and ginger",
    ],
    directions: [
      "Nestle the pitted dates in a clean jar.",
      "Warm the ghee gently with the spices and pour over the dates until covered.",
      "Let soak, the longer they rest, the richer they become. Enjoy one as a daily tonic.",
    ],
  },
];

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

// ── Writings (the blog) ──────────────────────────────────────────────────────
export type Writing = {
  slug: string;
  title: string;
  date: string; // ISO
  kind: "essay" | "poem";
  excerpt: string;
  paragraphs?: string[]; // essays
  stanzas?: string[][]; // poems: stanza -> lines
  related?: { label: string; href: string };
};

export const writings: Writing[] = [
  {
    slug: "deep-bad-bad",
    title: "Deep Bad Bad",
    date: "2017-12-06",
    kind: "essay",
    excerpt:
      "I'm wanting to remember. Quite bad. Very bad. The deep kind of bad bad that feels so alive I can't not hear it.",
    paragraphs: [
      "I feel desperate, but that's not the right word. I'm not panicked. I don't feel that rush of adrenaline that says ya gotta do SOMETHING NOW. I don't feel lethargic, like the desperation took too long and now I'm just depressed. Not that kind. I don't feel worried or stressed or like I got to know what's about to happen. Funny, cause I'd think I would feel all this, but I don't. So maybe I don't feel desperate, but how else to say…?",
      "I'm wanting to remember. Quite bad. Very bad. The deep kind of bad bad that feels so alive I can't not hear it. And feel it. I feel you deep bad bad. I hear you calling me. I hear your need for me to stop and yet to go. For more and yet less. To say richer things with less talking. To worker harder softer. It seems so clear in flash and then it's a muck. Like muddy muck, like playful muck if I'd get in.",
      "And maybe that's the point at last. To just get in and see what swimming in the muck muck is like. To just muck around in the mud. Nothing special about the everyday mud mucking. But I like my lines straight and curvy and I want the mundane to sparkle. I want it golden honey soothe my mama mind washed up on the dishes shore let me live again kind of yum.",
      "I want to remember it's all ok, whether they need me to lay down to fall asleep or I make them cry it out, whether they eat graham crackers from the floor or the coconut curry I spent hours to make, whether they watch television or only play with wooden toys… I want to remember it's ok. That who I am is way more important to them than the details of movement. Than the details of organic. Than the details of timing. Time time timing you spin me right round baby right round. Ready settie here I go.",
    ],
  },
  {
    slug: "enough-oomph-to-get-there",
    title: "Enough Oomph to Get There",
    date: "2017-11-03",
    kind: "essay",
    excerpt:
      "There is no “safe” from the outside world. But the walls we build trying to safeguard ourselves from future pain… that is the real suffering.",
    paragraphs: [
      "I was nervous when I decided to offer this work. I knew it meant living on the edge of my own vulnerability, in my relationship with Sam, and my relationships in all of my life. If this is the work I want to share, then I better be ready for my own life to have the wattage increased. Yep. I'm ready. I can't live any other way.",
      "I try sometimes. I do. Really. I try to back out, back up, go back to where it was “comfy.” I try to snuggle back under my ribs in the little caves of safety where I “think” I will be protected. My heart, that is. But the truth is, there is no “safe” from the outside world. Meaning that, life is happening all the time. Other people will let us down. They won't be who we thought they were supposed to be. They will be untrue. They might steal, lie, cheat, leave, die. We will experience pain. More than once. It's inevitable. But the walls we build trying to safeguard ourselves from future pain… that is the real suffering.",
      "Once I really saw this, I committed to a constant asking to have the courage to follow my heart. To really know the depths of the mystery within, and to follow it with fearlessness. I'm sure I've messed that up a bunch. But once I got it, it's like a red flashing light comes on anytime I'm out of alignment with this Love within. Anytime I make the choice for fear over love, it hurts enough that I can't ignore.",
      "When Jayanti and I separated and then divorced, it was because we both knew that our LOVE wanted to grow beyond our togetherness. And I don't say that lightly, but it's the truth. We did not know what that would look like at the time, but we knew we needed to go our own ways. And even though it was clear to both of us, it was not easy. It was not easy to unmake a life, a home, a family, a farm, a community, an image and a dream of the future. It was not easy to stay trusting all the way through when we had been like a warm blanket for one another.",
      "There were several moments when we could have turned back and said… ah what the heck, we'll stay together. But no. We couldn't do that. And a huge reason why was because we had a circle of people who were quite Heart Intelligent that were able to hold us and our clarity and our truth, through the process. People that could hold the “vibe,” if you will, of where we were headed while we were getting enough oomph to get there.",
      "When Sam and I first moved to the east coast, several people said to me, “New England” really wasn't ready for this sort of thing. I know for sure that isn't true, because I've met many souls here in New England who can hold a candle in the dark without turning back. I've met many women wanting to explore their deep creative nature, and I've met people offering this “sort of thing” in a different package.",
      "After the #metoo movement caught fire, I was particularly aware of the need for this exact kind of thing, a place for men and women to come together to heal, to be held in community, and to practice communication skills in a safe environment. A place to get deeper in touch with the longings of one's own heart. A place to experience the power of the circle. A place where everybody knows your name, and they're always glad you came… (lol, sorry, I couldn't help myself there, and if you're still reading, a joke was much needed. Cheers!) Loving y'all… m",
    ],
  },
  {
    slug: "how-i-came-to-kitchari",
    title: "How I Came to Kitchari",
    date: "2017-10-25",
    kind: "essay",
    excerpt:
      "All this cold, raw “healthy” food was healthy. Yes. But it was not healing. For me.",
    related: { label: "View the Kitchari recipe", href: "/recipes/kitchari" },
    paragraphs: [
      "Some of you know that I used to lead cleansing programs for people. I was super into it. It was a very green and clean, super liver-detoxifying program full of coffee enemas and garlic-grapefruit-olive-oil drinks. Yep, really. And I saw a lot of good things happen. Like a lot. So many people ready to change their lives, using this detox program to reset their direction, calm their inner world, and clean out a lot of past junk. People ready to end habits like four pizzas a week, two pots of coffee a day, daily fast food, sugar habits, and other fairly standard American diet styles. People ready to shift on physical, mental, and emotional levels. It was a cool time of life. I was pretty high on life. The green life. And I still have great respect for many of these methods, especially for the right constitution.",
      "But after several years of this kind of cleansing, I started to feel anxious, scattered, ungrounded, and my digestion seemed like it was weak. By that I mean I had a lot of gas, from both ends, and I felt bloated and constipated often. I was doing everything “right” in my mind, so I was quite confused.",
      "I had heard of this yogini who taught a small group of students and offered Ayurvedic consultations. I had studied some Ayurveda when I was younger, but didn't have a great understanding of it. I sought her out, got my consultation, and had my world turned upside down. No more green drinks, raw kale smoothies, seed and nut bars, or salads for now, she said. That alone was a lot to take in. She explained why, and it made perfect sense, it was just not the world I had been living in for the last several years.",
      "She explained that my digestive fire, known in Ayurveda as AGNI, had become very weak from all the raw foods I had eaten. It was like throwing cold water on a fire. All this cold, raw “healthy” food was healthy. Yes. But it was not healing. For me. You see, the super green and raw stuff is light and airy, cool and dry, Ayurveda calls it vata, having the qualities of air. Too much of it causes lightness, dryness, and coolness. And I was already all those qualities: getting thin, living in a very dry climate with dry skin and dryness on the inside, always cold even in a hot climate. I had become quite nervous and fearful, also associated with vata out of balance. It was because of this fearfulness overpowering my life that I decided to give her program a try.",
      "She offered a very different kind of “cleanse” than I had been doing. This one would be a nourishing program, giving my body plenty of what it needed so that it could do what it needed to do. It had several elements: meditation, warm-oil self-massage called Abhyanga, ghee shots in the morning (really!), and lots of this warm soupy stuff called Kitchari.",
      "Kitchari was intimidating to me at first. I was used to blending up some fruit or veggies in my Vita-Mix and voilà, a meal. This Kitchari stuff I had to cook step by step: cooking spices, adding seaweed, organic rice, and split mung dhal. I didn't like it at first. It took too much time. It didn't seem cleansing. How was I going to purify my liver with all this warm food?! But after a few days, I began to notice a couple of things. The main thing was that my belly was at ease. No bloating. Little gas. Regular bowel movements. And I felt a lot more relaxed. I wasn't pacing while thinking. I could sit and meditate for fifteen minutes and then go about my day with a lot more peace than I had felt in years.",
      "I restarted my yoga practice, not because I had to, but because I was inspired to. My husband noticed I was much calmer. And I was enjoying the process. I did miss the zing and high of my raw food (and I'm not bashing raw food at all, it was just not right for me, given my constitution, life circumstances, and a long stretch of immense stress), and I missed the sheer deliciousness of my morning smoothies. But it was undeniable that I felt much better when not drinking cold drinks to start my day. Instead I began with warm water and hot teas to support gentle detoxifying and jump-start my digestion.",
      "A note on deeper detoxes: if we try to pull things out of the body too fast, or things it is not prepared to deal with (like heavy metals), we can actually re-toxify ourselves, creating a more complicated situation. That work can be done safely under the guidance of great doctors and skilled professionals, but it's something to be aware of with deep green cleanses. Seek guidance and professional oversight if you are trying to detox heavy metals or any other specific poison.",
      "One of the biggest things with cleanses is coming OFF the cleanse. Now the cupboards are open and you can have anything you want, and it can be a challenging time! Many people find this harder than the cleanse itself, because it is such a radical shift. After the kitchari cleanse, I slowly transitioned to a bit more rice than beans (a bit more nourishing than detoxifying), started adding other grains and some fermented dairy like buttermilk (takradhara), and stayed with warm, soupy meals for several days because it felt so good to eat that way. I kept Kitchari as one of our mainstay meals and found the transition to be an easeful one.",
      "These days with little ones, anytime anyone is sick or just a little off, we have kitchari. Anytime I don't know what to make for dinner (breakfast or lunch, for that matter), I make kitchari. There are as many variations as you can think of, and you can rest knowing it will nourish, soothe, and bring balance to your home.",
    ],
  },
  {
    slug: "me-too",
    title: "Me Too",
    date: "2017-10-18",
    kind: "poem",
    excerpt: "Divine we all are / and divine we shall be / let us help / one another / to heal and become free.",
    stanzas: [
      ["Ego ego", "I hear you darling", "pulling me across the floor", "faster faster faster", "more", "more more."],
      ["Clothes and makeup", "hair and a smile", "I've got", "to give you", "a rest", "for awhile."],
      ["Too much time", "spent", "planning for the next", "taking today", "to be here", "just this text."],
      ["Ego Ego", "I know you're scared", "trying to keep alive", "keep from pain", "keep from vulnerability", "keep from", "too much growth."],
      ["It's true", "I get you.", "I do. I do.", "But alas this life", "is not only for you."],
      ["It's for deeper missions", "and inside transitions", "and head to the ground", "full prostration", "admissions."],
      ["And a terrible wild", "night full of stars", "to awaken", "the dream at last", "fallen into ash."],
      ["I hear you love", "I hear you light", "I hear you Great Intelligence", "I won't turn from you", "keep me constant", "keep me true."],
      ["No more dividing,", "I'm open to you", "and you and you.", "Heart Light growing stronger", "I linger no longer", "in the veils of separation", "time is now for co-creation."],
      ["Show me my judgement", "that I might give it", "up today", "I am open to see", "what I have placed in my way."],
      ["And as many keep posting", "and sharing their stories", "me too", "me too", "no shame, no glories."],
      ["Just a wink and a reach", "out across time", "to say to my brothers and sisters", "divine…."],
      ["Divine we all are", "and divine we shall be", "let us help", "one another", "to heal and become free."],
      ["I see where I too", "have created", "some pain", "and with years of self-forgiveness", "I released the shame."],
      ["For we've all been confused", "and at times forgotten", "who we are,", "now is time", "to come together", "to become like stars."],
      ["Little lights", "to heal darkness", "and take down", "the walls,", "this is for you", "all my people", "let us not stall."],
      ["Let us not wait", "any longer to be", "the light that we are", "that Love", "our true power", "in this humanity."],
    ],
  },
];

export function getWriting(slug: string): Writing | undefined {
  return writings.find((w) => w.slug === slug);
}

// ── Yoga practice videos ─────────────────────────────────────────────────────
export type PracticeVideo = {
  youtubeId: string;
  title: string;
  note?: string;
};

export const practiceVideos: PracticeVideo[] = [
  {
    youtubeId: "hUYGjrJ6BGQ",
    title: "Shoulder Health",
    note: "Practices for freeing and strengthening the shoulders.",
  },
  {
    youtubeId: "lt1Dc3iUNzA",
    title: "Down Dog Walkthrough",
    note: "A short exploration of downward dog.",
  },
  {
    youtubeId: "6pgNvmDn0GI",
    title: "Breath Expansion Practice",
    note: "A guided practice for widening the breath body.",
  },
  {
    youtubeId: "00YtYrOQhMI",
    title: "Hip Opening Foundations",
    note: "Two keys to open your hips safely, the top of the sacrum moves in and up to establish the natural curve of the low back, while stabilizing ankle and knee.",
  },
  {
    youtubeId: "anJhCcPvf1s",
    title: "Muscle Energy vs Organic Energy",
    note: "Two complementary currents at the heart of Anusara practice.",
  },
  {
    youtubeId: "Cb3zt9MgiyQ",
    title: "Hands and Shoulders",
    note: "Foundations for bearing weight with ease.",
  },
  {
    youtubeId: "M09-bvAsNLU",
    title: "Opening to Love, Sufi Practices",
    note: "Joyful heart practices from the Ruhaniat lineage.",
  },
  {
    youtubeId: "L5K6ASZuYek",
    title: "About Opening to Love",
    note: "A brief explanation of how Mackensie came to this work.",
  },
];

// ── Testimonials ─────────────────────────────────────────────────────────────
export type Testimonial = { quote: string; author: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "When I first heard about the women's circle my gut screamed YES! I not only needed this experience, I wanted it. What was surfacing was me. Long clouded in “niceness” and fear of rejection, the circle allowed me to say it all, to unleash it all, to express without apology. This is such powerful work. I couldn't possibly recommend it more. Ultimately it has helped me explore the fullness of my being in an incredibly supportive, safe and loving environment. Thank you for your work, Mackensie!",
    author: "K.B.",
  },
  {
    quote:
      "Mackensie provided an invaluable experience of safety and connection, and encouraged pushing the envelope of comfort in order to release, learn and grow. A talented, intuitive facilitator, she guided with wisdom, love, empathy and humor. I can truly say that I feel more acceptance of all the parts of me, particularly those I have so often rejected and neglected, and thus acceptance of others as well. This sisterhood connection, love and affection has filled my heart.",
    author: "Ally G.",
  },
  {
    quote:
      "My retreat with Mackensie was an incredibly expansive experience. Each day brought its own medicine, much of which continues to show up for me in surprising ways even months after. She powerfully held a safe, sacred and deeply loving container in which any and all internal experience was safe to be felt, expressed, and released. My favorite part is her ability to see the real, real underneath my surface expressions, and to challenge me in her most loving yet direct way. Through her, more than any other teacher, I've learned the deep bliss that can come from giving attention to my pain.",
    author: "Erin M.",
  },
];

// ── About page content (from the 2026 About) ─────────────────────────────────
export const aboutPillars = [
  {
    title: "Intelligent Embodiment",
    body: "Movement as inquiry. Five teacher trainings with senior teachers including Richard Freeman, John Friend, and Darren Rhodes.",
  },
  {
    title: "Sacred Touch for women",
    body: "Craniosacral, polarity, Temple Lomi, hands that listen as much as heal, drawing from nearly three decades of intuitive bodywork.",
  },
  {
    title: "Heart IQ & Women's Circles",
    body: "A decade of facilitating transformation through the work of Christian Pankhurst and Joan and Tomas Heartfield, in Maine, the Seacoast, and Maui.",
  },
  {
    title: "Medical Intuition",
    body: "Training with Skylar Acemesis. Exploring the hidden patterns, emotional, energetic, physical, that live at the root of illness.",
  },
];

export const lineageTeachers: { name: string; url?: string }[] = [
  { name: "Richard Freeman", url: "https://www.richardfreemanyoga.com" },
  { name: "John Friend", url: "https://bowspring.com" },
  { name: "Darren Rhodes", url: "https://www.darrenrhodesyoga.com" },
  { name: "Noah Maze", url: "https://themazemethod.com" },
  { name: "Neesha Zollinger", url: "https://neeshayoga.com" },
  { name: "Marc St. Pierre" },
  { name: "Myra Lewin", url: "https://halepule.com" },
  { name: "Skeeter Tichnor", url: "https://opentolifeyoga.com" },
  { name: "Caroline Myss", url: "https://myss.com" },
  { name: "Daisy Lee", url: "https://www.radiantlotusqigong.com" },
  { name: "Christian Pankhurst", url: "https://heartiq.org" },
  { name: "Skylar Acamesis", url: "https://skylaracamesis.com" },
  { name: "Sufi Ruhaniat Order", url: "https://www.ruhaniat.org" },
];

// Practice milestones. The two year figures auto-increment — they're computed
// from the current year, so they go up by one each year with no manual edit.
const BODYWORK_SINCE = 1996; // 30 years as of 2026
const YOGA_TEACHING_SINCE = 1998; // 28 years as of 2026

export function getStats() {
  const year = new Date().getFullYear();
  return [
    { value: `${year - BODYWORK_SINCE}`, label: "Years of Bodywork" },
    { value: `${year - YOGA_TEACHING_SINCE}`, label: "Years Teaching Yoga" },
    { value: "5", label: "Teacher Trainings" },
    { value: "7+", label: "Silent Retreats" },
  ];
}
