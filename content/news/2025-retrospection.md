---
title: "2025: Big Changes are Coming"
date: 2026-01-01T00:00:00+00:00
draft: false
categories:
- News
- New Year
author: matyrobbrt
summary: "A retrospection on the past year (take three)"
---

Yes, you've read the date right. No, your calendar isn't wrong. It is indeed 2026.  
With 2025 behind us, it's time to look at what the past year has brought for NeoForge, and even for the entire Minecraft modding community.

## The Versions
When [we entered 2025](../2024-retrospection), 1.21.1 was only a few months old and several packs for 1.21.1 were in development. 18 months after 1.21's release, it still remains the most popular NeoForge version, having accumulated over 16000 mods, with a growth rate surpassing that of Forge for 1.20.1.  
1.21.11 is now the latest Minecraft version, and 1.21 is also the first major version to reach 12 releases.

At the same time, 1.21.11 is also likely to be the last Minecraft version that has the major component `1`. Mojang has announced [a new version numbering scheme](https://www.minecraft.net/en-us/article/minecraft-new-version-numbering-system) for the new releases starting in 2026. Under the new scheme, the first hotfix of the second drop of 2026 would be `26.2.1`. Snapshot versioning has also been changed to a more straightforward format: the first snapshot for the first drop of 2026 (which has already been released, and we even have NeoForge builds available! more on that later) is `26.1-snapshot-1`.

![New versioning scheme](https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/screenshots/Version_Numbering_Example.jpg)
*The scheme as it would apply to the 2025 drops*

As you might have guessed, NeoForge's versioning scheme will need to be adjusted to account for this. The current proposal is available [here](https://gist.github.com/shartte/bb9bcecf039b02af0132980ef5f4a63c), though it is not final. We will announce a final one before 26.1 is released. Additionally, we are currently working on a meta API for listing versions which we hope to have available by the time 26.1 is released.

## Obfuscated game? No more
The versioning scheme is not the only thing changing in 2026. Another change Mojang has announced is the [removal of obfuscation](https://www.minecraft.net/en-us/article/removing-obfuscation-in-java-edition). For a long time, Minecraft's code was obfuscated - that is, replacing the names of different parts of the code with generated names (e.g. `a`, `b`, `cvb`, etc.). Starting with 26.1 snapshots, obfuscation is no longer present and game executables are shipped with real variable, class, field and method names.  
On the other hand, Mojang has been providing official mappings (more information about mappings is available [here](../../personal/sciwhiz12/what-are-mappings)) since 1.14, and as these mappings have been used by Forge (and later NeoForge) as the only supported set of mappings since 1.17, obfuscation was effectively invisible in NeoForge development environments. With that in mind, the removal of obfuscation does come with certain benefits to NeoForge developers:
- method parameter names were not included in the official mappings set, and instead were crowd-sourced by projects like [Parchment](https://github.com/ParchmentMC). These projects, however, were often incomplete or inaccurate and not always up-to-date. Now, official method parameter names will be visible;
- local variable names will also be visible, after years of confusing variable names, especially in dense methods. Gone are the days of `f14` and other similar variable names.

Historically, there have been various sets of mappings for the obfuscated game. Fabric's mappings set, Yarn, famously gave the name `Identifier` to the class that Mojang used to call `ResourceLocation`, which was the source of a long-lasting debate in the modding community. In 1.21.11, the last obfuscated version of the game, Mojang renamed `ResourceLocation` to `Identifier`. Whether this was done as a tribute to Yarn, a project now made defunct, is an exercise left to the reader.

## NeoForge for 26.1 snapshots
As I've previously mentioned, the first 26.1 snapshot is already available, and is **not** obfuscated. Given that that patches relied on SRG parameter names and decompiler-generated JAD style local variable names, porting to this snapshot took a great deal of effort and manual labour, and many bugs were likely introduced in the process. As a result, we have decided to publish official releases for this snapshot on the maven, to be used by modders and players alike (more information available [here](../26.1snapshots)). We ask all users willing to dedicate time to try out these builds to do so and report any issues they encounter.

This is not to say that we will not publish snapshot versions to maven for other drops too. It all depends on the time that Maintainers are able to dedicate to the project during the snapshot cycle.

## The NeoForge Changes
Now, some of the changes we've made this year.

Let's start with the changes we've made to 1.21.4:
- A system for mods to request [synchronization of recipe data](https://github.com/neoforged/NeoForge/pull/2021) to clients was implemented after vanilla stopped sending full recipe information;
- Recipe ingredient overlaps can now be solved through the [recipe priority system](https://github.com/neoforged/NeoForge/pull/1855).

Moving on to [1.21.5](../21.5release):
- As we have planned, the Nashorn Engine used by JavaScript coremods [is no longer shipped by default](https://github.com/neoforged/NeoForge/pull/2072). We encourage users of JS coremods to switch to Java-based coremods. If you still wish to use JS coremods, you'll have to ship the engine yourself;
- The anvil events have been [refactored](https://github.com/neoforged/NeoForge/pull/2260);
- A way to mark [block capabilities as proxyable](https://github.com/neoforged/NeoForge/pull/1446) has been introduced.

Next up is [1.21.6](../21.6release), with its two hotfixes, 1.21.7 and 1.21.8:
- Added [syncable data attachments](https://github.com/neoforged/NeoForge/pull/1823). This feature has been backported to 1.21.1 too;
- Removed `RuntimeDistCleaner`, making `@OnlyIn` purely a marker annotation for vanilla classes. Starting with this version its [runtime stripping behaviour is no longer functional](https://github.com/neoforged/NeoForge/pull/2397) and warnings will be emitted if mod classes use the annotation;
- Added a separate [client-side payload handler registration event](https://github.com/neoforged/NeoForge/pull/2272), to aid in common-client separation;
- Allow command suggestions (autocomplete) to [search all modded paths](https://github.com/neoforged/NeoForge/pull/2522) at once without a namespace provided;
- A [data map](https://github.com/neoforged/NeoForge/pull/2551) that replaces `AxeItem#STRIPPABLES` has been introduced;
- Added [a warning](https://github.com/neoforged/NeoForge/pull/2396) to advise against adding synced `EntityDataAccessor`s to foreign entities, as opposed to a synced data attachment;
- Empty registries synced from the server are now [ignored](https://github.com/neoforged/NeoForge/pull/2473), allowing clients to connect to the server.

As for [1.21.9](../21.9release), and its hotfix, 1.21.10:
- A major rework of the transfer API has been [introduced](https://github.com/neoforged/NeoForge/pull/2663). This includes the addition of transaction and a generic `ResourceHandler` interface. More information is available on the [dedicated blog post](../21.9-transfer-rework);
- The FML transformation API has been [reworked](https://github.com/neoforged/NeoForge/pull/2655), to accomodate more use-cases that previously required unsupported workarounds;
- [Data-driven keyframe animations](https://github.com/neoforged/NeoForge/pull/2644) have been made accessible to custom `ItemModel`s and `SpecialModelRenderer`s;
- An API for [registering custom debug screen entires](https://github.com/neoforged/NeoForge/pull/2699) has been added.

And finally some of the changes made to 1.21.11, the latest version (which is still in beta):
- An event that fires when [game rules have been changed](https://github.com/neoforged/NeoForge/pull/2876) has been added.

### FancyModLoader changes
In no particular order, here is a list with the most important changes made to FML in 2025:
- Mixin configs can now be made conditional on the presence of specific mods ([#237](https://github.com/neoforged/FancyModLoader/pull/237));
- A new FML config to enable OpenGL debugging and object labels ([#265](https://github.com/neoforged/FancyModLoader/pull/265));
- Introduced a new early loading screen whose look & feel can be customized through [themes](https://github.com/neoforged/FancyModLoader/blob/main/earlydisplay/THEMING.md) ([#278](https://github.com/neoforged/FancyModLoader/pull/278));
- The `lowcode` loader has been removed and replaced by making `javafml` the default. Most mods should not specify either the loader or loader version in their neoforge.mods.toml ([#237](https://github.com/neoforged/FancyModLoader/pull/237));
- FML now selects the same OpenGL version as Vanilla does to fix several rare startup issues due to graphics driver bugs ([#262](https://github.com/neoforged/FancyModLoader/pull/262));
- When using `@EventBusSubscriber`, the type of bus no longer needs to be specified ([#290](https://github.com/neoforged/FancyModLoader/pull/290));
- The project has been consolidated and no longer depends on external libraries such as ModLauncher, SecureJarHandler, or BootstrapLauncher to start the game; 
- Several changes have been made to decrease the amount of work performed during startup to ultimately speed it up:
  - `@OnlyIn` annotations are no longer processed - this previously required every class to be parsed at runtime ([#293](https://github.com/neoforged/FancyModLoader/pull/293));
  - FML now implements its own MixinService instead of relying on the ModLauncher integration that was built into Mixin itself. This was done to prevent that integration from parsing every class during startup ([#319](https://github.com/neoforged/FancyModLoader/pull/319));
  - Implement a new VFS API to reduce reliance on custom NIO FileSystems ([#332](https://github.com/neoforged/FancyModLoader/pull/332), [#342](https://github.com/neoforged/FancyModLoader/pull/342), [#350](https://github.com/neoforged/FancyModLoader/pull/350));
  - Instead of having to reassemble the Minecraft jar at runtime from several smaller files, FML now supports loading Minecraft from a single pre-processed jar file ([#337](https://github.com/neoforged/FancyModLoader/pull/337));
  - Rewrote the entire startup process to simplify it after ModLauncher has been inlined and to enable more optimizations down the line ([#357](https://github.com/neoforged/FancyModLoader/pull/357)).
- Rewrote the FML class-loader to align with how the JDK classloader for modules works ([#351](https://github.com/neoforged/FancyModLoader/pull/351));
- Add support for Mixin "compatibility levels", which enables updates of Mixins without risking breaking existing mods ([#353](https://github.com/neoforged/FancyModLoader/pull/353));
- Early Services (GraphicsBootstrapper, Mod Locators) can now utilize Jar in Jar ([#375](https://github.com/neoforged/FancyModLoader/pull/375));
- Added a custom early error screen to show errors immediately when dependencies are not met or other mod loading issues occur, instead of waiting for the game to load first ([#385](https://github.com/neoforged/FancyModLoader/pull/385));
- `@Mod` entrypoints can now declare that they only should be loaded when specific mods are present ([#393](https://github.com/neoforged/FancyModLoader/pull/393)).

### Toolchain improvements
Our Gradle plugins now have the ability to generate only Minecraft *binaries* (without sources), greatly speeding up CI runs.

Starting with 1.21.9, separate configurations for non-Minecraft libraries (i.e. `additionalRuntimeClasspath`) are no longer needed. Instead, you can use the normal configurations (`implementation`, `runtimeOnly`, etc.).  

MDG can now use a shared cache for Minecraft assets, speeding up CI runs by downloading them only once. For more information on how to set it up, check out the documentation of the [dedicated GitHub Action](https://github.com/neoforged/actions-modding?tab=readme-ov-file#minecraft-asset-caching).

### Installer improvements
The installation process in newer versions is now faster, as a result of simplification. Additionally, we're looking at automatically patching the Minecraft jar at startup starting with 26.1, which will simplify the process even more.

A universal installer is also looking more likely, with the meta API coming in the near future.

## Yes. Stats.
Now, it's time for my favourite hobby. Boring everyone with pointless statistics they have never asked for.

167 issues have been closed as completed in the past year, in the [NeoForge repository](https://github.com/NeoForged/NeoForge). 633 pull requests have been merged. That's around 2 pull requests per day, 12 per week and 52 per month. 311 of them were created by Maintainers, 233 by bots (these include Crowdin PRs, automated backport PRs and dependency updates), meaning that 14% of them were created by other contributors outside of our team.

Looking at absolute version numbers, 1.21.5 is the winner, reaching 96 versions, followed by 1.21.10 with 64 versions and 1.21.8 with 52 versions.

Next, let's take a look at how fast we released initial versions for new Minecraft releases: NeoForge for 1.21.5 was released within 59 minutes of the official release, 1.21.6 within 40 minutes, 1.21.7 within 45 minutes, 1.21.8 within 2 hours and 24 minutes, 1.21.9 within 2 hours and 55 minutes, 1.21.10 within 59 minutes and 1.21.11 within 2 hours and 54 minutes.

As for the Discord server: in the past 120 days, over 240000 messages have been sent in the server, and over 700 servers are following our announcement channels.

Moving on to maven statistics: in 2025, our maven repository has served over 1.4 billion requests, totalling to over 383 terrabytes of traffic, averaging at a terrabyte per day. 47% of the requests came from Europe (compared to 45% in 2024), 38% from North America (compared to 41% in 2024), 8% from Asia, 4% from South America and 1% from Oceania, the remainder coming from Africa. In terms of data centers, 23% of the requests were served from Moscow, 22% from Los Angeles, 10% from Frankfurt, and 6% from Amsterdam.

Traffic was at a peak in November, when we served 46 terrabytes worth of files, while requests peaked in July, totalling 148 million. The file that used up most of the bandwidth remains the 1.21.1 [NeoForm](https://github.com/neoforged/neoform) artifact (which is used by all installations of NeoForge, in both production and development environments), being requested over 10 million times, representing 11 terrabytes (3%) of the total traffic.

And finally, 2 more people have joined our team in 2025.

# ...and a happy New Year
So... we find ourselves welcoming a new year again. The year that marked our second anniversary has ended, and we're excited about what the new year will bring.  

Our team and the community we've built is grateful to everyone that has contributed to our projects in the past year - team members and outside collaborators alike. NeoForge's growth has been geniunely overwhelming, and I hope you are enjoying all of our changes. We're always open to suggestions, and we encourage anyone to join our [Discord server](https://discord.neoforged.net) and share their thoughts.

After all, this is a volunteer-run project, and it simply wouldn't have been possible without the remarkable support we've received from the community. We're grateful for your trust, and we hope we haven't let you down!

Happy 2026, everyone, and as always, **happy porting**! 🎉