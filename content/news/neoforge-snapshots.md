---
title: "NeoForge for Snapshots"
date: 2024-03-13T12:30:00+01:00
categories:
- News
author: neoforgedteam
summary: |
    Our team regularly updates NeoForge to snapshot versions of Minecraft.
    This helps us anticipate changes, and spread out the porting work.
    In accordance with our commitment to transparency, we are now making the code for NeoForge snapshot versions public.
description: |
    Our team regularly updates NeoForge to snapshot versions of Minecraft.
    This helps us anticipate changes, and spread out the porting work.
    In accordance with our commitment to transparency, we are now making the code for NeoForge snapshot versions public.
---

## Introduction
Our team regularly updates NeoForge to snapshot versions of Minecraft.
This helps us anticipate changes, and spread out the porting work.
In accordance with our commitment to transparency, we are now making the code for NeoForge snapshot versions public.

In the past, we have been porting NeoForge to snapshots and pre-releases entirely in private,
and the only information available to the community was the list of commits shown in the `#neoforge-private` channel
on our [Discord server](https://discord.gg/neoforged).

In reality, only the initial phase of a port needs to be private, as we work with the raw Minecraft sources to fix the patches that could not be applied.
Once we are done with porting these patch _rejects_ and fixing compilation issues,
we will now publish the code for snapshot ports on the main NeoForge repository, on a separate branch.

## Release Model
Snapshot versions of NeoForge are alpha versions, versioned based on the next stable release, the target snapshot and a timestamp: `<next stable release>-alpha.<target snapshot>.<timestamp>`.

As of this post, these versions must be built manually. They are not available from our installer or our Maven repository.

## Support
**NeoForge for snapshot versions is not intended for playing.**
Our main goal is to discover bugs and prepare for changes in the next release of Minecraft.

If you encounter NeoForge bugs on a snapshot version,
we encourage you to report them to our GitHub issue tracker.
However, we cannot guarantee a timely fix.

## Disclaimer
**Snapshot updates are not guaranteed.**
The team will decide if and when it is appropriate to port to a snapshot,
depending on the size of the snapshot, the current team availablity, etc...

## For Modders
Modders that want to play around with the latest snapshot versions of Minecraft to see how their code will be affected can build a NeoForge snapshot version.
However, we strongly advise against releasing mods for snapshot versions and/or using them in production environments.
We also encourage modders to prioritize support for stable releases of Minecraft.

## For Contributors
**Our main focus remains on the stable releases of Minecraft.**

Only changes relevant to the updates should be submitted to a snapshot branch.
Every other change should be submitted to the main branch as usual.
Currently this is the `1.20.x` branch.

Commits submitted to a snapshot branch will be squashed with the rest of the port into a single commit.
Large changes will not be accepted, and should wait for a breaking change window.

## Conclusion
We hope that this new approach will allow for more polished NeoForge updates to new Minecraft versions.
Let us know what you think!
