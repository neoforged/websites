---
title: "Installer files and modder information"
date: 2023-07-19T09:40:37-04:00
draft: false
categories:
author: cpw
summary: |
    NeoForged installer files, as well as news and other information from the NeoForged project
description: |
    NeoForged installer files, as well as news and other information from the NeoForged project
---
# NeoForge installer files
You can find a direct link to our latest installer file below.

{{< files "1.20.1" >}}

Note: this file is still called forge because we're trying to maintain compatibility with launchers,
assuming they don't hardcode things too much.

# Using NeoForge for mod development

## If you don't have a current mod project

1. Go to [The MDK] and click `Use This Template` to create a copy in your personal GitHub space.
2. Clone this project locally, and get started! Our [Documentation] and the [Modding Wiki] are great places to learn more.

## If you have an existing mod project
You can use neoforge in your existing mod development as well. To do so:
1. Update your repositories to use `https://maven.neoforged.net/releases` instead of `https://maven.minecraftforge.net`
2. Update your ForgeGradle to use NeoGradle 6.0.12 or above:
    ```
    plugins {
        ...
        id 'net.neoforged.gradle' version '[6.0.13, 6.2)'
    }
    ```
3. Update your `minecraft` dependency to use `net.neoforged:forge` and the version as shown above.

### Some things to note
1. At the present time, mods built by either system should be intercompatible between forks.
2. Do note that recently, there were some changes in the recommended way to use ForgeGradle/NeoGradle. Note especially the way that `settings.gradle` has changed, as well as the removal of the `buildscript` section in `build.gradle`. Refer to [The MDK] for an example and more.

[The MDK]: https://github.com/neoforged/MDK
[Documentation]: https://docs.neoforged.net
[Modding Wiki]: https://forge.gemwire.uk