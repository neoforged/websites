---
title: "Early display errors"
date: 2023-06-14T23:10:31-04:00
draft: false
categories:
author: neoforgeteam
summary: "Some troubleshooting steps if you can't load NeoForge's early display"
description: "Some troubleshooting steps if you can't load NeoForge's early display"
---
# So you were told to come here by an error message when running minecraft with neoforge

There's several steps we can take to try and get you running with Minecraft and NeoForge.

1. Go and read the [Microsoft Guidance](https://aka.ms/mcdriver) for this problem. 
This contains a lot of useful information, including steps like updating your graphics drivers, 
and minimum requirements to play the game. Remember, if you can't run the vanilla game using the vanilla launcher, we can't help you run NeoForge.
2. If you can run the vanilla game, but can't run NeoForge, you may need to turn off the fancy early loading display.
To do so, find your minecraft game folder, and edit the config/fml.toml file. Change the "earlyWindowControl" line from `earlyWindowControl=true` to `earlyWindowControl=false`
Make sure you come discuss your problem on the [NeoForge discord](https://discord.neoforged.net), because this shouldn't be necessary.




