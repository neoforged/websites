---
title: "Mitigating Network Vulnerabilities"
date: 2026-05-11
draft: false
categories:
- News
author: championash5357
summary: |
    This blog post explains NeoForge's patch for a network object allocation exploit,
    and how modders can mitigate these issues in their own serverbound packets.
---

# Mitigating Vulnerabilities: Network Object Allocation

NeoForge 26.1.2.44-beta and 21.1.229 fixed a potential exploit where a client could crash the server using a maliciously crafted network packet. Players and server owners can either do one of the following to mitigate the issue:

- Upgrade to the latest NeoForge for 26.1.2 / 1.21.1.
- For older NeoForge and Minecraft versions, install Drex's `CrashExploitFixer` ([CurseForge](https://www.curseforge.com/minecraft/mc-mods/crashexploitfixer) / [Modrinth](https://modrinth.com/mod/crashexploitfixer)).

For most, that's enough information to not have to worry about the issue. But what does it mean to exploit a network packet? Does it mean mods are vulnerable?

Let's dive deeper to get a better understanding of how this exploit occurs and what can be done to mitigate it.

## Understanding Network Vulnerabilities

When we talk about network vulnerabilities, we are generally talking about exploiting serverbound requests in one form or another. This is because the client typically has to "trust" the server as the authoritative party and that it is not going to operate maliciously, whereas the server can't assume every client that's connected is acting in good faith. As such, the server must validate and sanitize anything it receives from the client.

### Object Allocation

One such sanitization process has to do with object allocation: where the game requests and reserves a block of memory to store an object. For most data types, this will generally be a relatively small number of bytes (e.g., an `int` is 4 bytes, while a reference is either 4 or 8 bytes depending on JVM settings). However, arrays provide a different story.

When declaring an array, you have to specify an initial capacity that declares its size, whether that'd be directly through the `new` constructor, or by passing in a certain number of elements into the declaration. As such, the array will attempt to allocate the data type size times the capacity. For example, if we declared a `new Object[10]`, where each object reference is 4 bytes, then at least 4 * 10 = 40 bytes will be allocated by the array. That doesn't sound like a lot at first, but what if we instead near `Integer.MAX_VALUE` as the capacity? Then, the array will attempt to allocate around 4 * 2^31 = 8,589,934,592 bytes, or ~8GiB of data. This vulnerability is known as [Memory Allocation with Excessive Size Value](https://cwe.mitre.org/data/definitions/789.html).

As you can imagine, depending on the Minecraft server settings, this large amount of memory allocation can cause a denial-of-service, throw an `OutOfMemoryError`, or even kill the server itself.

> Fun fact, depending on the JVM (e.g., HotSpot), setting the size of the array to a value greater than or equal to max array length (`ArraysSupport.SOFT_MAX_ARRAY_LENGTH` or 2,147,483,639) will [throw an `OutOfMemoryError("Requested array size exceeds VM limit")`](https://github.com/openjdk/jdk/blob/22b46872d0d647c9ef9f4414b4685afa8313926d/src/java.base/share/classes/jdk/internal/util/ArraysSupport.java#L854).

## The Exploit

With this knowledge, let's look at one of the exploit points in `FriendlyByteBuf#readCollection`:

```java
// From `FriendlyByteBuf`
public <T, C extends Collection<T>> C readCollection(IntFunction<C> ctor, StreamDecoder<? super FriendlyByteBuf, T> elementDecoder) {
    int count = this.readVarInt();
    C result = (C) ctor.apply(count);

    // ...
}
```

As you can see, first the `count` is read from the buffer, which is then passed to the `IntFunction` to construct the `Collection`. How does it construct the collection? Well, looking at one of its callers `readList`, it passed in `Lists::newArrayListWithCapacity`, which constructs a new `ArrayList<C>` by calling `new Object[count]`.

Notice the issue? The `count` variable is provided by the client, meaning it leaves open the potential for exploitation. The same goes for `readMap` as, under the hood, all these collections of elements are doing is providing a unique method to wrap around an array.

## The Mitigation Strategy

If that's the case, wouldn't that mean sending any collection across the network is vulnerable to such an attack? Well, no. Let's take a look at another implementation provided by `StreamCodec`s:

```java
// From `ByteBufCodecs`
static <B extends ByteBuf, V, C extends Collection<V>> StreamCodec<B, C> collection(
    IntFunction<C> constructor, StreamCodec<? super B, V> elementCodec, int maxSize
) {
    return new StreamCodec<B, C>() {
        @Override
        public C decode(B input) {
            int count = ByteBufCodecs.readCount(input, maxSize);
            C result = constructor.apply(Math.min(count, MAX_INITIAL_COLLECTION_SIZE));

            // ...
        }

        @Override
        public void encode(B output, C value) {
            // ...
        }
    };
}
```

Here, we can see the same implementation, except that the `count` is first min-ed with the `MAX_INITIAL_COLLECTION_SIZE`, or 65,536 entries. This limits the initial allocation to around ~256KiB, which is unlikely to crash the server. The collection will still increase its capacity if you are sending more than 65,536 entries, but at that point, you are limited by the max packet size of ~2MiB compressed (~8MiB uncompressed) and NeoForge's own payload size limit of ~32KiB.

NeoForge used the same strategy that `ByteBufCodec`s does: limiting the initial allocation of collections and maps to the `ByteBufCodecs.MAX_INITIAL_COLLECTION_SIZE`.

## What does this mean for mods?

For most mods, nothing changes. The mod loaders have mitigated the issue, so unless you are reimplementing `readCollection` or `readMap` yourself, a mod will not be vulnerable. However, this assumes that the data your packets contain is limited to only what's necessary and that the server is properly validating what it receives.

If you ever looked at a vanilla serverbound packet (e.g., `ServerboundEditBookPacket`, `ServerboundChangeGameModePacket`), you can see that the amount of data sent in each is relatively sparse. The packet only provides enough information such that the server understands what the client's intention is, using the data stored on the server to fill in the rest of the gaps (e.g., `ServerboundEditBookPacket` sends the slot the stack is in, rather than the `ItemStack` itself). Additionally, many of the serverbound packets that make use of variable types define limits on how much data can be sent to the server in one packet.

There are two packets that step away from this rule. `ServerboundChatCommandSignedPacket` calls `FriendlyByteBuf#readCollection` directly when attempting to deserialize the `ArgumentSignatures`; however, it limits the maximum capacity to 8 entries via `FriendlyByteBuf#limitValue`, throwing a `DecoderException` if a larger value is sent. `ServerboundSetCreativeModeSlotPacket`, on the other hand, sends the entire `ItemStack` to set in the specified slot, which can be exploited depending on the `DataComponentType`s available. Though in that case, an additional validation is performed to make sure the server player's `Abilities.instabuild` (e.g., in creative mode) is true before attempting to decode.

With these points in mind, modded serverbound packets should attempt to replicate vanilla: contain only the minimal information required to perform the appropriate action on the server. And if you need to allocate any kind of collection or map of elements, set a maximum capacity.

Happy modding!
