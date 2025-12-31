---
title: "2023: The Good, The Bad... and The Fork"
date: 2024-01-01T00:00:00+00:00
draft: false
categories:
- News
- New Year
author: neoforgedteam
summary: "A retrospection on the past year"
description: "A retrospection on the past year"
---

2023 was certainly an eventful year for the Forge community. 😅

Now that we're entering 2024, it's time we, the NeoForged team, do some retrospection on what's happened in the past 6 months.

## The Fork

Let's begin with addressing the elephant in the room: who even _are_ we?

NeoForge is a fork of the Minecraft Forge project. It was [officially announced](https://neoforged.net/news/theproject/) (ahead of schedule) on July 12, 2023, and nearly everyone from the original Forge team has joined NeoForged, with one obvious exception: LexManos.

There were many motivations and reasons which caused the fork; the most obvious ones were disagreements between the team (particularly the triage team) and the management. Some of the lesser reasons were the freedom to play around with and refactor much of the internal structure and surrounding infrastructure, from the modding API to the modloading system. These changes diverge drastically with Forge, which historically has held strict stances against changes to certain areas and against larger reworks in general, so starting with a “cleaner” slate was easier.

## The Good

Our team has grown by 6 members, but we are still in search of more members such as maintainers of our repositories. (Interested? Apply by [filling up our application form](https://links.neoforged.net/apply).)

Since the fork, we have worked on improving several areas of the codebase. For instance, we have rewritten [our Gradle plugin](https://github.com/NeoForged/NeoGradle) and now provide [support for Parchment by default](https://github.com/neoforged/neogradle?tab=readme-ov-file#apply-parchment-mappings).  

And as a result, we have made various changes to the NeoForge API:
- Our [first refactors](https://github.com/neoforged/Bus/milestone/1?closed=1) were suffered (in the good sense of the word) by [EventBus](https://github.com/NeoForged/Bus) (our fork of EventBus), improving its performance and internals, alongside some modder-facing benefits like preventing (accidentally) listening to abstract classes;
- In 1.20.2, the first major overhaul landed: the registry system was significantly overhauled ([#257](https://github.com/neoforged/NeoForge/pull/257)), simplifying its internals and improving consistency with vanilla;
- Since 1.20.2 we are shipping [MixinExtras](https://github.com/LlamaLad7/MixinExtras) by default ([#303](https://github.com/neoforged/NeoForge/pull/303)) so that modders can write more compatible mixins;
- Transitioning to 1.20.3, the Capabilities system has been reworked ([#73](https://github.com/neoforged/NeoForge/pull/73)) as our second major overhaul, splitting them into data attachments and API providers, and addressing some long-standing flaws of the old system (for example, the old system didn't support `Block` capabilities. Yes, you can now use your favourite pipe mod to extract fluids from cauldrons);

1.20.4 was full of changes too:
- A test framework ([#291](https://github.com/neoforged/NeoForge/pull/291)) was added, making the process of testing Neo features more straightforward, and integrating nicely with Mojang's `GameTest` system, improving as such the long-term stability of the platform. This framework will be made available to mods in the future;
- A way for mods to mark themselves as incompatible with other mods was also introduced ([#397](https://github.com/neoforged/NeoForge/pull/397));
- The chunk pre-generation command `/neoforged generate` ([#364](https://github.com/neoforged/NeoForge/pull/364)) was faced with various improvements, especially performance ones. (For those unaware, the command can be used by server owners to pre-generate chunks, so gameplay doesn't cause worldgen between all players simultaneously.) We would like to thank Jasmine and Gegy for allowing us to use their mod as a basis for the new command;
- We have set up a [Crowdin project](https://crowdin.neoforged.net/) where you can submit translations for different languages (and request new languages to be translated to); and
- Our third major overhaul: [The Networking Refactor](https://github.com/neoforged/NeoForge/pull/277).

We have additionally made several performance improvements to ModLauncher and its sister projects, including work on reducing start-up times.

These changes are accompanied by some major infrastructure changes too:
- We have also introduced a system for [Publishing PRs to GitHub Packages](https://github.com/neoforged/NeoForge/pull/429) that will make testing changes easier (for users *and* modders) before they're merged properly into the version everyone uses.
- Most (if not all, baring one exception) of our projects are now built with GitHub Actions.
- We're currently planning to overhaul our infrastructure to a new server setup in the somewhat-near future.

On the Discord server side, we relaxed our rules regarding coremods and older versions; you can now discuss and receive support for those freely. Additionally, discussion of other loaders is no longer banned—it's encouraged even, as long as it is productive. After all, NeoForge doesn't exist in a vacuum, and all APIs have their objective downsides and upsides.

## Adoption

Even though it is too early to draw conclusions (as 1.20.1 is the *de facto* target for modpacks in the 1.20 lifecycle), we are seeing more and more mods using NeoForge starting with 1.20.4.  

We are also happy to report that [CurseForge](https://www.curseforge.com/download/app), [Modrinth](https://modrinth.com/app), [Prism](https://prismlauncher.org/) and [FTB](https://www.feed-the-beast.com/) have all added support for NeoForge in their launchers, which we're grateful for!

## Time for some stats - in classic Wrapped style

NeoForged has obviously not existed for a full year, but here are some stats on the 173 days since our public departure in 2023:

- We have served an average of a terabyte's (1000 gigabytes) worth of Maven artifacts every month, with 10 million requests just in December.
- Over 200 PRs have been merged. That's more than a PR per day!  
- Over 95 issues have been closed as completed. That's one every two days!

## The bad
The world, however, isn't only pink and bright. We've made mistakes, and we own up to them.

We apologise for the sudden, disorganized and confusing rebranding of the Discord server. For reasons not worth going into (nor relevant in this post), we had to go public _months_ before we anticipated, so we were caught off guard. It was a mess, and if we could turn back time and do it better, we would.

We also apologise for not providing the stable 1.20.1 environment we promised. After 1.20.2 was released, we neglected 1.20.1 and still are. Development efforts on 1.20.1 are better spent on Forge rather than NeoForge.  

Documentation (or lack thereof) is something Forge has always had problems with, and we too suffer from a pressing lack of documentation all around the toolchain and the API too. We have made several changes in the past months, while letting our existing documentation slowly get outdated. In 2024, we'll look at improving this sensitive yet important area of the project.

We had to find our pace one way or another, but in the end we're sorry you all had to see us fight and argue. We hope to improve and learn from our mistakes in the year that comes.

## So… what's next?

We don't have a lot of plans for 2024, but some of the more pressing matters include:

- With all refactors taken care of, a stable 1.20.4 release can be expected within the first two weeks of 2024, if not sooner;
- A rework of FML—a beast of complexity that we are trying to simplify—has been due for a long while. You can follow the progress and provide your ideas [in the `FML Clean-up` Discord thread](https://discord.com/channels/313125603924639766/1187879036815417456);
- We are collaborating with Mumfrey to hopefully get Mixin out of its 2-year-long stagnation. If that doesn't pan out, we will be open to alternative;
- We are working on improving the caching of NeoGradle, to reduce build times;
- 1.21 is expected to unify the tag namespace between NeoForge and Fabric through TelepathicGrunt's efforts via [the unification PR](https://github.com/neoforged/NeoForge/pull/135);
- As we've already mentioned: docs, docs, and more docs!
- Some potential changes to the transfer (`IItemHandler`, `IFluidHandler`, `IEnergyStorage`) capabilities are also being discussed [in the `Transfer rework` thread](https://discord.com/channels/313125603924639766/1183818213134446742);
- Replacing JavaScript coremods with Java-based coremods is also on the table, [at the `Coremod changes` thread](https://discord.com/channels/313125603924639766/1105595318197825557/threads/1155582283839983658).

As always, we appreciate your input, and we'd be grateful if you would provide us with feedback or ideas in our [Discord server](https://discord.neoforged.net) or in a [GitHub Discussion](https://github.com/neoforged/NeoForge/discussions).

# …and thanks for all the fish

Now, for the fun part you were all waiting for: the thanking!

NeoForge wouldn't have been possible without the team members that left Forge with us, for which we thank them.

We thank all of our contributors to our many projects during the last 6 months, and we wholeheartedly thank **YOU** for your support - our achievements are thanks to the community feedback and the people who give us the chance to make errors and bounce back, only to grow stronger and stronger.  

Happy 2024, everyone, and as always, **happy porting**! 🎉