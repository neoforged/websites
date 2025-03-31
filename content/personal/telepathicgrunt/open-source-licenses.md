---
title: "Open Source Licenses: A Quick Guide"
date: 2025-03-31T00:33:12+08:00
categories:
- Personal Blog
author: TelepathicGrunt
summary: "There are numerous licenses and options one can pick from to use for their mod. We are going to dive into a small subset of them, Open-Source Licenses."
description: "This guide will talk about what are Open-Source Licenses, why they are good for the community, go into detail about some commonly used Open-Source Licenses, and what to watch out for with some. It is not a fully comprehensive guide but is a good strt. Reminder, neither me nor the NeoForge team are lawyers and anything we say cannot be taken as legal advice."
---

{{< box note >}}
Reminder, neither me nor the NeoForge team are lawyers and anything we say here cannot be taken as legal advice.
{{< /box >}}

The reason for this blog is the NeoForge team as a whole, feel that Open-Source license is a good practice to encourage in the modding community. It allows modders to learn from each other and be able to contribute code to repositories or fork a mod if that mod goes abandoned.

> **Note:** Once you pick a license for your mod, it is highly discouraged to change that license in the future. Especially if many other people helped contribute code to the mod

**However, you should not put a license on your mod without understanding what that license entails.** For Open-Source licenses, they generally do two things when applied to mods:

- Requires that the mod’s code is publicly visible or given to anyone that asks for the source code.

- Usually requires crediting the original modder if another modder takes some that source code. *(Some licenses goes farther and require the modder to make their project Open-Source as well if they use that licensed code in their mod)*

Here are some Open-Source licenses that are commonly used in the Minecraft modding community. Note, the following are short summaries of the licenses and are not legal advice. Read the license’s own text directly to make sure you agree with the terms that the license will apply to your mod before using it.

- **MIT license:** <https://opensource.org/license/mit> : <https://www.tldrlegal.com/license/mit-license>

  - This license is very “open” in the sense that it places minimal restrictions on others to take your code. All it asks for is that the copied code have the MIT license notice applied to it so others reading the new code can know where that code originally came from. It does mean that a modder can take MIT code and put it into a commercial ARR (All Rights Reserved) project. MIT license also specifically allows “private use” so a server owner can modify your mod to use on a server without restriction.

- **LGPLv3:** <https://opensource.org/license/lgpl-3-0> : <https://www.tldrlegal.com/license/gnu-lesser-general-public-license-v3-lgpl-3>

  - This license is more restrictive where it requires modders taking your code to make their own project be Open-Source as well using a license compatible with LGPLv3 along with stating where the original code came from (usually a link to original repository). It also requires that the modder states all the changes they did to the copied code. The modder can use the code in a commercial project as long as that project is now Open-Source. Note, there is a catch with LGPLv3 where a server owner could modify a serverside LGPLv3 mod and does not have to reveal the source due to the wording of the license.

- **OSL-3.0:** <https://opensource.org/license/osl-3-0-php> : <https://www.tldrlegal.com/license/open-software-licence-3-0>

  - This one is more relaxed than LGPLv3 where copiers have to Open-Source their projects and give credit to the original code owner but does NOT need to add a link to the original repository nor state what changes were done. The copied code can be used in commercial Open-Source projects as well. A big difference with OSL-3.0 is that it closes the loophole where if a server owner modifies a serverside mod, they now must provide the source when asked.

- **Apache-2.0:** <https://opensource.org/license/apache-2-0> : <https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0>

  - Modders taking your code must add a NOTICED file with attribution to you and state all the changes they did to the copied code. They do not need to Open-Source their mod and can use it in commercial ARR (All Rights Reserved) projects. It is similar to the MIT license but requires a more visible credit to the original owner of the copied code. Apache-2.0 also specifically allows “private use” so a server owner can modify your mod to use on a server without restriction.

- **MPL-2.0:** <https://opensource.org/license/mpl-2-0> : <https://www.tldrlegal.com/license/mozilla-public-license-2-0-mpl-2>

  - This one allows people to use your code in their commercial closed source projects. Just the copied and/or modified code portion must be publicly available or freely given when asked. This license also requires the modder to include a link to your repository so others can get the original software. They do not need to state any changes they made to your code. Server owners are allowed to modify the software as this license specifies that “distribution” is only about sending a copy of the software itself to another. See here for info about distribution: <https://www.mozilla.org/en-US/MPL/2.0/FAQ/#what-does-distribute-mean>

> Notice, we did not mention GPL license. This is because GPL alone is not valid for a Minecraft mod because it requires all software linked to the mod to be Open-Source. And since Minecraft is essentially All Rights Reserved, that GPL license is not valid unless modified to have a classpath exception. We would encourage using LGPLv3 instead of GPL for ease if you were thinking of using GPL.

Another thing to keep in mind, many of these licenses are only applicable to the code itself. For assets like textures or sound, you should put those under a different license. Modders tend to have a LICENSE.txt file for the code licenses and a LICENSE_ASSETS.txt file for asset licences. On CurseForge, they would pick the Custom License option and then put the two licenses there clarifying what each is applicable for.

Once again, me and the NeoForge team are not lawyers. If you ever need actual legal advice on what a license entails for a Minecraft mod, please consult a real lawyer.