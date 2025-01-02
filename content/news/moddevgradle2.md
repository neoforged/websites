---
title: "ModDevGradle 2 Stable Release"
date: 2025-01-02T15:30:00+01:00
categories:
- News
author: technici4n
summary: |
    ModDevGradle 2 is stable. How to update, what changed, and what ModDevGradle is anyway.
---

ModDevGradle 2 is stable as of yesterday.
We recommend that all ModDevGradle 1.0.x users update to ModDevGradle 2.0.x.
The latest version can be found at all times [on the project listing](https://projects.neoforged.net/neoforged/moddevgradle).
As of this blog post, it is `2.0.72`.

## How to update to ModDevGradle 2
Upgrade the version of the `net.neoforged.moddev` plugin in your build script to a `2.0.x` version,
and fix any issues that arise from the upgrade.
To help fix upgrade issues,
we collected all breaking changes and suggested fixes on [this document](https://github.com/neoforged/ModDevGradle/blob/main/BREAKING_CHANGES.md).

The [README](https://github.com/neoforged/ModDevGradle/blob/main/README.md) is also a good reference.

Finally, help is available on [our Discord server](https://discord.neoforged.net),
in the `#modder-support-gradle` channel.

## What is ModDevGradle anyway?
[ModDevGradle](https://github.com/neoforged/moddevgradle) is a new Gradle plugin for NeoForge mod development,
focused on performance, simplicity, and ease of use.

It is built on top of the following components:
- [NeoFormRuntime](https://github.com/neoforged/NeoFormRuntime): A standalone tool to create decompiled and recompiled Minecraft artifacts. Moving these steps to a separate tool allows for easy testing and development of the decompilation-recompilation pipeline without Gradle's complexity getting in the way.
- [GradleMinecraftDependencies](https://github.com/neoforged/GradleMinecraftDependencies): Gradle-friendly metadata containing Minecraft dependencies.
- Additional Gradle metadata published in [NeoForm](https://github.com/neoforged/NeoForm).
- Additional Gradle metadata published in [NeoForge](https://github.com/neoforged/NeoForge).

Note that [NeoGradle](https://github.com/neoforged/NeoGradle/) continues to be supported.

## Notable improvements in ModDevGradle 2
Besides bug fixes and small improvements, here is a collection of notable changes in ModDevGradle 2:
- Support for Forge versions 1.17 to 1.20.1 and NeoForge 1.20.1, using a new legacy plugin.
If you are still supporting 1.20.1 or older versions, we recommend that you upgrade from ForgeGradle to the MDG legacy plugin. More information about the legacy plugin is available on a [dedicated documentation page](https://github.com/neoforged/ModDevGradle/blob/main/LEGACY.md), and we are available to help on Discord.
- Support for NeoForge 1.20.4 and 1.20.6. All versions starting from 1.21 continue to be supported, of course.
- Streamlined support for [DevLogin](https://github.com/covers1624/DevLogin), an implementation of the Minecraft authentication protocol for development environments.
- Support for Visual Studio Code launch configurations.
- Support for command-line launch scripts, for usage with debugging tools such as Render Doc, Nsight, perf, etc...
  They can be generated using the `gradlew createLaunchScripts` task,
  and will be available under `build/moddev/runXxx.{cmd|sh}`.

Additionally, (a subset of) ModDevGradle is now used to develop NeoForge itself.
