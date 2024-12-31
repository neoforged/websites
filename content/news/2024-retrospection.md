---
title: "2024: The first Mod Packs"
date: 2025-01-01T00:00:00+00:00
draft: false
categories:
- News
author: matyrobbrt
summary: "A retrospection on the past year (take two)"
description: "A retrospection on the past year (take two)"
---

Believe it or not, another year has passed.  
2024 is behind us, and with that, it's time we, the NeoForged team, look back and take a walk down memory lane.

## Widespread Adoption
When we forked, the latest Minecraft version was 1.20.1. As Mojang started releasing new 1.20 versions it was obvious that the community will not move to the new versions until 1.21. While we did release 1.20.1 builds for a short while, multiple mods and packs had already been released using Forge, and some hosting platforms and launchers did not add support for our 1.20.1 versions. We came to the conclusion that we should drop 1.20.1 and instead focus on improving new versions, in order to prepare for 1.21, the version we expected to start seeing wide adoption.

On June 13th 2024, 11 months and a day after we announced the fork, Mojang released the first version of the 1.21 lifecycle. On July 28th, we decided to stabilise 1.21, releasing the first stable version of the lifecycle: `21.0.143`. It was expected that, similar to 1.20, this minor version of Minecraft will be the focus of the community until 1.22. And it seems like this is the case.

In august, Mojang released 1.21.1, a (cold) hotfix. Fortunately, this version was not going to affect many mods. As multiple packs and mods had already been using the 1.21 stable versions, we immediately dropped 1.21 support and chose to release the first build of 1.21.1 without a beta period.

Over the past 6 months, multiple packs using NeoForge have been released amounting to millions of downloads, and over 4000 mods are available for NeoForge on 1.21.1. This is our first version with wide adoption and we would like thank everyone that made it possible.

While our current focus is on 1.21.4, the newest Minecraft release, we will continue to support 1.21.1, and we recommend modders that decide to try out newer versions to do the same.

## The Changes
2023 ended with a refactor of the networking system in 1.20.4. Since then, we have made multiple other changes to our various projects over the course of 7 new Minecraft versions.

Let's start by mentioning that in 1.20.4 we [switched to Fabric's version of Mixin](https://github.com/neoforged/FancyModLoader/pull/94), which comes with multiple enhancements and features mentioned in the linked pull request.

Now let's look at [1.20.5](../20.5release/) (and its hotfix, 1.20.6) which mark the end of the 1.20 lifecycle:
- The `mods.toml` file was renamed to `neoforge.mods.toml`;
- We have decided to start releasing [NeoForge builds for snapshots](../neoforge-snapshots/);
- The tag namespace has been [unified with other loaders](https://github.com/neoforged/NeoForge/pull/135), making datapacks more compatible with modded content across multiple loaders;
- Tick events [have been split](https://github.com/neoforged/NeoForge/pull/542) into individual abstract classes, with their own `Pre` and `Post` variants;
- We have made [changes](https://github.com/neoforged/NeoForge/pull/929) around mod entrypoints, allowing mods to declare multiple (or zero) `@Mod` classes. Proper separation of client code is also easier, as the `@Mod` annotation can have a `dist` specified, loading entrypoints only on the side requested;
- The generic `Event.Result` [was removed](https://github.com/neoforged/NeoForge/pull/588) and replaced with specialised classes to reduce confusion and improve documentation;
- We added [configs that load during early startup](https://github.com/neoforged/FancyModLoader/pull/150);
- Java coremods have been [reintroduced](https://github.com/neoforged/FancyModLoader/pull/79), deprecating JavaScript coremods for removal. We recommend that all mods still using JS coremods switch to the new system, as it provides better performance;
- Support for [unit testing using JUnit](https://github.com/neoforged/ModDevGradle?tab=readme-ov-file#unit-testing-with-junit) has been introduced. Unit tests are suitable for tests that do not require a level, therefore being faster than game tests.

Next up, [1.21](../21.0release/) (and its hotfix, 1.21.1):
- The enum extension system has been replaced with a [new data-driven system](https://github.com/neoforged/FancyModLoader/pull/148);
- The damage pipeline [has been reworked](../21.0release/#damage-pipeline-rework-introduced-in-neoforge-21031-beta) to reduce confusion and improve documentation;
- The plant type system [has been replaced](../21.0release/#planttype-system-is-now-replaced-introduced-in-neoforge-21039-beta);
- The configuration UI [has been reintroduced](../21.0release/#config-gui-returns-added-in-neoforge-210110-beta), currently being opt-in for mods.

[1.21.2](../21.2release/) (and its hotfix, 1.21.3) also came with a few changes:
- ANTLR is no longer shipped with NeoForge as the access transformer system has been rewritten and uses a custom parser, reducing runtime overhead and the size of NeoForge installations;
- NeoForge's own development now uses an [in-tree Gradle plugin](https://github.com/neoforged/NeoForge/pull/1485), making tooling iteration easier in the future;
- A system that makes it possible for mods to register [custom feature flags](https://github.com/neoforged/NeoForge/pull/1619) has been introduced. This feature has been backported to 1.21.1;
- [Dependency overrides](https://github.com/neoforged/FancyModLoader/pull/214) have been added. They can be used to relax dependency type and range constraints so that a mod is able to run even when an incompatible mod is present or a compatible version of a dependency isn't present. This feature has been backported to 1.21.1.

And last, but not least, 1.21.4 (yes, there is no hotfix for it... at least not yet):
- We have started [generating built-in access transformers](https://github.com/neoforged/NeoForge/pull/1719) based on different programatic rules, widening the access of commonly used classes, methods and fields;
- Datagen suffered a few changes: we have [removed](https://github.com/neoforged/NeoForge/pull/1725) our own model generators in favour of Vanilla's, and `ExistingFileHelper` is also gone.

Don't worry, we're not done modernizing the project, this was just the beginning. We're currently experimenting with multiple changes related to FML and its sister projects, so stay tuned!

### MDKs
We have split our MDK repo into per-version and per-plugin MDK mirrors on a [separate organization](https://github.com/neoforgemdks) to make it easier to create repositories using GitHub's template feature. We're also working on a MDK generator website, expect it to be usable sometime in the first half of 2025.

### Installer changes
- A CLI argument to install a client (`--install-client`) has been added to the installer, making automating installations easier;
- The GUI has received various visual improvements, and a progress bar that reliably tracks the progress of the installation has been added;
- Buttons and messages are now translated (you can contribute to the translations on our [Crowdin project](https://crowdin.neoforged.net/));
- An option to generate fat installers for offline use or to reduce downloads has been introduced (3 stackable options available: installer libraries, Minecraft jars, Minecraft libraries);
- The installer will now automatically install a server in headless environments, without the need of specifying the `--install-server` CLI argument.

### ServerStarterJar
We have developed a [server starter jar](https://github.com/neoforged/ServerStarterJar). This project provides an executable jar file that can be used to start NeoForge **and Forge** servers as a wrapper around the run scripts introduced in 1.17.  
The starter can also manage your NeoForge version, installing and updating it to the correct version automatically. Check its documentation for more information.

### ModDevGradle
[ModDevGradle](https://github.com/neoforged/ModDevGradle) is an alternative modding Gradle plugin initially released with the 1.21 release. Since then, various improvements to it have been made, and its 2.0 major version is about to be stable soon, having received its final expected changes.

Fun fact: ModDevGradle has a [legacy plugin](https://github.com/neoforged/ModDevGradle/blob/main/LEGACY/) too! This plugin allows you to develop for Forge versions since 1.17 and up to (and including) 1.20.1, while having most of the benefits of ModDevGradle. We recommend that modders who still maintain their mods for those versions switch to the legacy plugin as it also reduces the amount of buildscript changes which will be needed if you wish to port to newer NeoForge versions.

## Team changes
2024 also brought a few changes to our team, which has grown by 6 more members (I promise, it's just a [coincidence](../2023-retrospection/#the-good)).

Additionally, we have held [Steering Council elections](../sc-elections-2024/). In short, cpw and Curle have abolished their permanent seats in the council. Thefore, all 3 seats have been up for election. Gigaherz, OrionOnline and TelepathicGrunt will serve on the new steering council until the next elections in late 2025.

## Did anyone say stats?
Yes, it's that time again: time for some fun stats no one asked for.  

322 issues have been closed in the past year as completed. 734 pull requests have been merged, 78 of which were marked as being a breaking change. That's 2 pull requests per day, 14 per week and 61 per month. 530 of them were created by Maintainers, meaning that 27.8% of them were created by other contributors outside of our team.

The version that has received the most PRs is 1.21 with 170, followed by 1.20.4 with 167 PRs (this year, as 1.20.4 received 69 PRs in 2023). However, when collapsing hotfix minor Minecraft versions, 1.20.5 and 1.20.6 have received a total of 172 PRs together, 1.21 and 1.21.1 261 PRs, 1.21.2 and 1.21.3 65 PRs, and lastly, 1.21.4 47 PRs.

In terms of absolute version numbers, 1.20.4 is the winner, reaching 238 versions, followed by 1.21 with 167 versions, 1.20.6 with 124 and 1.21.1 with 92.

Next, let's take a look at how fast we released initial versions for new Minecraft releases: 1.20.5 was released within 5 hours and 50 minutes of the official release, 1.20.6 within 3 hours and 25 minutes, 1.21 within 1 hour and 45 minutes, 1.21.1 within 3 hours and 46 minutes, 1.21.2 within 1 hour and 38 minutes, 1.21.3 within 50 minutes and 1.21.4 within 32 minutes.

Now, for some maven statistics. It's worth noting that these do not cover the entire year, but only its second half, as June 17th is when we migrated to a new CDN provider, [CDN77](https://www.cdn77.com/).  

Our maven repository has received over 370 million requests, totalling to 84 terrabytes of traffic, and averaging at 400 gigabytes a day. 45% of the requests came from Europe, 41% from North America, 8% from Asia, 4% from South America and 1% from Australia, the remainder coming from Africa. In terms of data centers, 21% of the requests came from Moscow, 17% from Los Angeles and 7% from Frankfurt.

Traffic peaked in October, when we served 23 terrabytes worth of files, while requests peaked in August, totalling 70 million. The file that used most bandwidth was the 1.21.1 [NeoForm](https://github.com/neoforged/neoform) artifact (which is used by all installations of NeoForge, in both production and development environments), being requested over 1.2 million times, representing 1.6 terrabytes (2%) of the total traffic.

# ...and a happy New Year
So... here we are. The year that marked our first anniversary has ended, and we're cheerfully looking forward to the new year.  

We would like to thank everyone that contributed to our projects in the past year. NeoForge has been a refreshing experience for us, and I hope y'all are enjoying the ride too. We're always open to suggestions, and we encourage anyone to join our [Discord server](https://discord.neoforged.net) and share what's on their mind.  

In the end, this is a volunteer-ran project which would not have been possible without the overwhelming support we have received from the community. We sincerly appreciate everyone who has decided to stick with us and we hope it was worth it!

Happy 2025, everyone, and as always, **happy porting**! 🎉