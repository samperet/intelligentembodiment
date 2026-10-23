// TEMPORARY one-time import of the Marisa Peer library. Adds these exact
// entries, which stream from the shared Google Drive folder. Remove this
// route once the import is done.
import { NextResponse } from "next/server";
import { canAccessMedia, cookieReader } from "@/lib/media";
import { getMediaLibrary, isR2Configured, saveMediaLibrary } from "@/lib/r2";
import type { MediaTrack } from "@/lib/mediaShared";

export const dynamic = "force-dynamic";

const ARTIST = "Marisa Peer";

const IMPORTS: Omit<MediaTrack, "artist" | "parts" | "added">[] = [
  {
    "slug": "marisa-peer-iae-program-01",
    "title": "Week 1 · Harness the Power of Your Mind",
    "album": "I Am Enough Program",
    "track": 1,
    "duration": 1497.52,
    "size": 37077332,
    "type": "audio/mpeg",
    "drive": "1KgUVPCi6LYBvFKBEuftlaF5Ii2O7zvdJ"
  },
  {
    "slug": "marisa-peer-iae-program-02",
    "title": "Week 1 · Hypnosis",
    "album": "I Am Enough Program",
    "track": 2,
    "duration": 1160.89,
    "size": 18583472,
    "type": "audio/mpeg",
    "drive": "1HPXwTXtZvs7MIj15ZP8N0_Xgp_uFgl8l"
  },
  {
    "slug": "marisa-peer-iae-program-03",
    "title": "Week 2 · Believe You Are Enough",
    "album": "I Am Enough Program",
    "track": 3,
    "duration": 1590.94,
    "size": 26600167,
    "type": "audio/mpeg",
    "drive": "1IyQahCAPIUglb9Xh0K7gRCe66A2IPlJa"
  },
  {
    "slug": "marisa-peer-iae-program-04",
    "title": "Week 2 · Hypnosis",
    "album": "I Am Enough Program",
    "track": 4,
    "duration": 622.25,
    "size": 24889920,
    "type": "audio/mpeg",
    "drive": "1c38GDjVLdb31qGaeOBf0Q7XzYL1EPYjL"
  },
  {
    "slug": "marisa-peer-iae-program-05",
    "title": "Week 3 · Wealth Wiring for Abundance",
    "album": "I Am Enough Program",
    "track": 5,
    "duration": 1068.3,
    "size": 17103685,
    "type": "audio/mpeg",
    "drive": "1ya1dxkkOwR_OkyTQ_AMtlKjoQSIxTeDH"
  },
  {
    "slug": "marisa-peer-iae-program-06",
    "title": "Week 3 · Hypnosis",
    "album": "I Am Enough Program",
    "track": 6,
    "duration": 1545.49,
    "size": 37102391,
    "type": "audio/mpeg",
    "drive": "19G-8ynqBODTNGjvfAxEV1UTVO70W2Wvl"
  },
  {
    "slug": "marisa-peer-iae-program-07",
    "title": "Week 4 · Living Your Life's Purpose",
    "album": "I Am Enough Program",
    "track": 7,
    "duration": 1256.7,
    "size": 21253066,
    "type": "audio/mpeg",
    "drive": "11rcXCgVZrObe0sIAL165ADh1rQFX8Hav"
  },
  {
    "slug": "marisa-peer-iae-program-08",
    "title": "Week 4 · Hypnosis",
    "album": "I Am Enough Program",
    "track": 8,
    "duration": 1525.13,
    "size": 49209771,
    "type": "audio/mpeg",
    "drive": "19nATlqKcSF1eI23iElqHQLHmqgMqiu33"
  },
  {
    "slug": "marisa-peer-iae-program-09",
    "title": "Week 5 · Strategies Successful People Live By",
    "album": "I Am Enough Program",
    "track": 9,
    "duration": 1333.0,
    "size": 21340694,
    "type": "audio/mpeg",
    "drive": "1JHrqpcnnYCNtBmgRD-GZ9nBktEG-kKEN"
  },
  {
    "slug": "marisa-peer-iae-program-10",
    "title": "Week 5 · Hypnosis",
    "album": "I Am Enough Program",
    "track": 10,
    "duration": 1256.12,
    "size": 30156084,
    "type": "audio/mpeg",
    "drive": "1LhxU-EhE-sJYIN5dXtZOtU5gE2ZhkTe-"
  },
  {
    "slug": "marisa-peer-iae-program-11",
    "title": "Success",
    "album": "I Am Enough Program",
    "track": 11,
    "duration": 1358.13,
    "size": 33731973,
    "type": "audio/mpeg",
    "drive": "1bRrfl7fC2w19_vx9FvaqOMWzJ1V4gUR0"
  },
  {
    "slug": "marisa-peer-iae-program-12",
    "title": "Body",
    "album": "I Am Enough Program",
    "track": 12,
    "duration": 1525.11,
    "size": 25547279,
    "type": "audio/mpeg",
    "drive": "1O6frS_3ug5J7AiQ7tJht9KJsWM3NQyy3"
  },
  {
    "slug": "marisa-peer-iae-book-01",
    "title": "Foreword",
    "album": "I Am Enough (Audiobook)",
    "track": 1,
    "duration": 193.83,
    "size": 4651934,
    "type": "audio/mpeg",
    "drive": "1dUqYcc6kfehwKZmaCo24P9EX-6P225a_"
  },
  {
    "slug": "marisa-peer-iae-book-02",
    "title": "Introduction",
    "album": "I Am Enough (Audiobook)",
    "track": 2,
    "duration": 1233.51,
    "size": 29604294,
    "type": "audio/mpeg",
    "drive": "1Zk9Gue1LiEZj1f4SQgHj1U4g6wNySh1F"
  },
  {
    "slug": "marisa-peer-iae-book-03",
    "title": "Chapter 1",
    "album": "I Am Enough (Audiobook)",
    "track": 3,
    "duration": 976.1,
    "size": 23426300,
    "type": "audio/mpeg",
    "drive": "1C3el0AFx54RuHHy1mGzdEg9L7Ao59XG8"
  },
  {
    "slug": "marisa-peer-iae-book-04",
    "title": "Chapter 2",
    "album": "I Am Enough (Audiobook)",
    "track": 4,
    "duration": 1632.56,
    "size": 39181468,
    "type": "audio/mpeg",
    "drive": "11hgGq8DOLD-IzxRNuI3FDeZ-5UgtUeJe"
  },
  {
    "slug": "marisa-peer-iae-book-05",
    "title": "Chapter 3",
    "album": "I Am Enough (Audiobook)",
    "track": 5,
    "duration": 2035.84,
    "size": 48860054,
    "type": "audio/mpeg",
    "drive": "15HiLBBGrXOw-zxhPRpt2OjN8ZfRGGLX0"
  },
  {
    "slug": "marisa-peer-iae-book-06",
    "title": "Chapter 4",
    "album": "I Am Enough (Audiobook)",
    "track": 6,
    "duration": 1562.45,
    "size": 37498780,
    "type": "audio/mpeg",
    "drive": "14xECCbD_lmvi7dz4q0AIlDtHZSu4P0eJ"
  },
  {
    "slug": "marisa-peer-iae-book-07",
    "title": "Chapter 5",
    "album": "I Am Enough (Audiobook)",
    "track": 7,
    "duration": 726.97,
    "size": 17447374,
    "type": "audio/mpeg",
    "drive": "1SHcfA6jHAENrVWivwBi9ssS4hek9EzVA"
  },
  {
    "slug": "marisa-peer-iae-book-08",
    "title": "Chapter 6",
    "album": "I Am Enough (Audiobook)",
    "track": 8,
    "duration": 902.98,
    "size": 21671622,
    "type": "audio/mpeg",
    "drive": "1UoAXsG8-r1Rl4E5yMM0zt4p3kkVIHnOE"
  },
  {
    "slug": "marisa-peer-better-lie-01",
    "title": "Part 1",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 1,
    "duration": 15.18,
    "size": 365393,
    "type": "audio/mpeg",
    "drive": "16cxVbGKRCwnWwUz23NLBRku8YPQo87XK"
  },
  {
    "slug": "marisa-peer-better-lie-02",
    "title": "Part 2",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 2,
    "duration": 191.22,
    "size": 4590267,
    "type": "audio/mpeg",
    "drive": "1isubhB0SGHpezwlY0iYZrK2riDar2DcV"
  },
  {
    "slug": "marisa-peer-better-lie-03",
    "title": "Part 3",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 3,
    "duration": 2035.75,
    "size": 48859109,
    "type": "audio/mpeg",
    "drive": "1846OnlWqm0gP31eygquzCCkoMTGmtHWu"
  },
  {
    "slug": "marisa-peer-better-lie-04",
    "title": "Part 4",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 4,
    "duration": 2838.21,
    "size": 68117999,
    "type": "audio/mpeg",
    "drive": "1b2zRjjTbMcSlRBColImYgdycd5vTvnq6"
  },
  {
    "slug": "marisa-peer-better-lie-05",
    "title": "Part 5",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 5,
    "duration": 2761.81,
    "size": 66284445,
    "type": "audio/mpeg",
    "drive": "1L2UvBQoooh2IcBveenCs4DbmzUaIzN0g"
  },
  {
    "slug": "marisa-peer-better-lie-06",
    "title": "Part 6",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 6,
    "duration": 2316.2,
    "size": 55589861,
    "type": "audio/mpeg",
    "drive": "1StLfB9ZytpNPJCsRvEbL5kxDBjIPhINs"
  },
  {
    "slug": "marisa-peer-better-lie-07",
    "title": "Part 7",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 7,
    "duration": 2777.25,
    "size": 66655037,
    "type": "audio/mpeg",
    "drive": "1e3XlN6G0Np1jcyM-EnmjEgvP_aaeEDJp"
  },
  {
    "slug": "marisa-peer-better-lie-08",
    "title": "Part 8",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 8,
    "duration": 2128.19,
    "size": 51077653,
    "type": "audio/mpeg",
    "drive": "1Dayf2YurlSmpFhHUJ0MhcHMScFztBXGi"
  },
  {
    "slug": "marisa-peer-better-lie-09",
    "title": "Part 9",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 9,
    "duration": 1909.98,
    "size": 45840537,
    "type": "audio/mpeg",
    "drive": "1ZL-g-XO0_4xosRJzJdIGZ42jEzrWRrf-"
  },
  {
    "slug": "marisa-peer-better-lie-10",
    "title": "Part 10",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 10,
    "duration": 1972.68,
    "size": 47345441,
    "type": "audio/mpeg",
    "drive": "1glHo7YZ5PQV4br7nPqZ1csZ1Z5NjGGAc"
  },
  {
    "slug": "marisa-peer-better-lie-11",
    "title": "Part 11",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 11,
    "duration": 2334.38,
    "size": 56026183,
    "type": "audio/mpeg",
    "drive": "102Vu2EeEhjJkpg7QziXsCh6y1w7B47Tm"
  },
  {
    "slug": "marisa-peer-better-lie-12",
    "title": "Part 12",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 12,
    "duration": 2521.08,
    "size": 60507091,
    "type": "audio/mpeg",
    "drive": "1bXb5fmvz5h1EK7pEPyYlcIUvVy4iMmsn"
  },
  {
    "slug": "marisa-peer-better-lie-13",
    "title": "Part 13",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 13,
    "duration": 1713.02,
    "size": 41113611,
    "type": "audio/mpeg",
    "drive": "1E2zz9wfMyARg29F0XVgDQmTOvD0U19Jw"
  },
  {
    "slug": "marisa-peer-better-lie-14",
    "title": "Part 14",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 14,
    "duration": 1236.51,
    "size": 29677217,
    "type": "audio/mpeg",
    "drive": "1bt8ZxqgJtX6kNE6nt9i-OeWH9fOMZLJD"
  },
  {
    "slug": "marisa-peer-better-lie-15",
    "title": "Part 15",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 15,
    "duration": 2445.5,
    "size": 58692943,
    "type": "audio/mpeg",
    "drive": "1bzOEmI1ZeMNORYYRhMqGuY-YAaJjUBf2"
  },
  {
    "slug": "marisa-peer-better-lie-16",
    "title": "Part 16",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 16,
    "duration": 1722.86,
    "size": 41349613,
    "type": "audio/mpeg",
    "drive": "1ACs4MkVFyirnH-vI8jotL3Ld3ePJZOs5"
  },
  {
    "slug": "marisa-peer-better-lie-17",
    "title": "Part 17",
    "album": "Tell Yourself a Better Lie (Audiobook)",
    "track": 17,
    "duration": 26.87,
    "size": 645841,
    "type": "audio/mpeg",
    "drive": "1QWWQxTp6G59RMKE7CUKhj4plDm1ae5ao"
  },
  {
    "slug": "marisa-peer-hypnosis-01",
    "title": "Become Rejection-Proof (Hypnosis)",
    "album": "Hypnosis & Meditations",
    "track": 1,
    "duration": 1854.85,
    "size": 59384132,
    "type": "audio/mpeg",
    "drive": "15hp9KDuCJE6Fzf2fNyzF6z3IhfJmFrAl"
  },
  {
    "slug": "marisa-peer-hypnosis-02",
    "title": "Believe in Yourself",
    "album": "Hypnosis & Meditations",
    "track": 2,
    "duration": 1273.55,
    "size": 50941980,
    "type": "audio/mpeg",
    "drive": "1H1Ae3e7A_4kRizT3j1VABfP0kQ8_877z"
  },
  {
    "slug": "marisa-peer-hypnosis-03",
    "title": "Conquer the Fear of Change (NICER Meditation)",
    "album": "Hypnosis & Meditations",
    "track": 3,
    "duration": 881.58,
    "size": 28221711,
    "type": "audio/mpeg",
    "drive": "1uw7Yq52H_ZwLxe9VFTSdVzU8EcFqMMn7"
  },
  {
    "slug": "marisa-peer-hypnosis-04",
    "title": "Embrace Your Confident Self (NICER Meditation)",
    "album": "Hypnosis & Meditations",
    "track": 4,
    "duration": 857.74,
    "size": 27463732,
    "type": "audio/mpeg",
    "drive": "1ya-xgO5sJZGB4InhWCHOwQlM4L24gH1W"
  },
  {
    "slug": "marisa-peer-hypnosis-05",
    "title": "Healing Vortex - Self-Worth",
    "album": "Hypnosis & Meditations",
    "track": 5,
    "duration": 1194.94,
    "size": 19131271,
    "type": "audio/mpeg",
    "drive": "1-Vj8pKvKbgmYaElgqoqoaxeqHmU3DJcJ"
  },
  {
    "slug": "marisa-peer-hypnosis-06",
    "title": "Installing the Cheerleader",
    "album": "Hypnosis & Meditations",
    "track": 6,
    "duration": 1207.7,
    "size": 38678293,
    "type": "audio/mpeg",
    "drive": "12-mAP9G3xR7tYYdCGnstPCDsUo0Ipkzh"
  },
  {
    "slug": "marisa-peer-hypnosis-07",
    "title": "Installing the Cheerleader (Alternate Version)",
    "album": "Hypnosis & Meditations",
    "track": 7,
    "duration": 1072.85,
    "size": 42928689,
    "type": "audio/mpeg",
    "drive": "14Wo7U4MbPwSWdpXCHJgqa5WuKjHwPV6q"
  },
  {
    "slug": "marisa-peer-hypnosis-08",
    "title": "Let Go of Fear, Anxiety & Overthinking (Meditation)",
    "album": "Hypnosis & Meditations",
    "track": 8,
    "duration": 1052.93,
    "size": 30093883,
    "type": "audio/mp4",
    "drive": "1wHWwFFu4x7bgnWtxwJLoZqetoTci3-7v"
  },
  {
    "slug": "marisa-peer-hypnosis-09",
    "title": "Overcome Social Anxiety (NICER Meditation)",
    "album": "Hypnosis & Meditations",
    "track": 9,
    "duration": 1281.68,
    "size": 30771981,
    "type": "audio/mpeg",
    "drive": "1hfi0fkalkZ2JWE1Afg9m-0HavLaoyydo"
  },
  {
    "slug": "marisa-peer-hypnosis-10",
    "title": "Powerful Inner Peace (NICER Meditation)",
    "album": "Hypnosis & Meditations",
    "track": 10,
    "duration": 783.19,
    "size": 12540978,
    "type": "audio/mpeg",
    "drive": "12nQaMyaeyH9SW8wJXrPhOvCLyFlmgnb1"
  },
  {
    "slug": "marisa-peer-hypnosis-11",
    "title": "Relationships",
    "album": "Hypnosis & Meditations",
    "track": 11,
    "duration": 1059.79,
    "size": 42394968,
    "type": "audio/mpeg",
    "drive": "1aqw_OM7_Mc0pbgg5s9F8a0tlh83wTuzo"
  },
  {
    "slug": "marisa-peer-hypnosis-12",
    "title": "Upgrading Your Inner Child",
    "album": "Hypnosis & Meditations",
    "track": 12,
    "duration": 509.91,
    "size": 20412762,
    "type": "audio/mpeg",
    "drive": "1hdApO8rn6lozr3_Nslc0raHItYQfIs8d"
  }
];

export async function POST(request: Request) {
  if (!canAccessMedia(cookieReader(request)) || !isR2Configured()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const items = await getMediaLibrary<MediaTrack>();
  const have = new Set(items.map((t) => t.slug));
  const added = IMPORTS.filter((t) => !have.has(t.slug)).map(
    (t): MediaTrack => ({ ...t, artist: ARTIST, parts: 0, added: new Date().toISOString() }),
  );
  if (added.length) await saveMediaLibrary([...items, ...added]);
  return NextResponse.json({ ok: true, added: added.length, total: items.length + added.length });
}
