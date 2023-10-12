---
title: "Event system changes in NeoForge 20.2"
date: 2023-10-11T13:36:00+02:00
draft: true
categories:
- News
author: technici4n
summary: |
    This post goes over the changes made to the "EventBus" subsystem of NeoForge 20.2.
    This does not cover specific events, but rather changes made to the event machinery itself.
description: |
    This post goes over the changes made to the "EventBus" subsystem of NeoForge 20.2.
    This does not cover specific events, but rather changes made to the event machinery itself.
---
_Draft: This is only valid up to commit 86e69ce. Still missing a few planned changes._

## Introduction
Over the past few weeks, we have been working on updating our event system.
This blog post will go through all of the changes that were made,
to act as a migration guide for modders updating to NeoForge 20.2.

Note that this post does not cover specific events, but rather changes made to the event machinery itself.

## Key changes
### Package change
The root package was changed from `net.minecraftforge.eventbus` to `net.neoforged.bus`.
Accordingly, the API is now in `net.neoforged.bus.api`.

Example migration:
```diff
- import net.minecraftforge.eventbus.api.EventBus;
+ import net.neoforged.bus.api.EventBus;
```

### Cancellable event changes
Cancellable events should now implement `ICancellableEvent` instead of using the `@Cancelable` annotation:

```diff
- @Cancelable
- public class MyEvent extends Event {
+ public class MyEvent extends Event implements ICancellableEvent {
      // Your event code
  }
```

Use `setCanceled(true)` to cancel events and `isCanceled()` to check if events are canceled. This did not change.

`post` now returns the posted event instead of whether the event was canceled. You can call `isCanceled()` on the result to achieve the previous behavior:
<!-- TODO: I suppose we are going to rename MinecraftForge.EVENT_BUS -->
```diff
- if (MinecraftForge.EVENT_BUS.post(new MyEvent())) {
+ if (MinecraftForge.EVENT_BUS.post(new MyEvent()).isCanceled()) {
      // Do something if the event was canceled
  }
```

### More `addListener` overloads
We added a few convenient overloads for lambda registration with `IEventBus#addListener`. For example, the following is now possible:
```java
bus.addListener(SomeEvent.class, event -> {
    // Listener code here.
});
```

### Generic events are deprecated for removal
Generic events are deprecated for removal, and will be removed in the future[^1]. We encourage modders to move away from them as soon as possible. NeoForge is still using them for `GatherCapabilitiesEvent` only. We will address this in capability rework.

### Event results are being phased out
For now, only the `@Event.HasResult` annotation is deprecated for removal.
We will eventually remove the `getResult()` and `setResult(result)` methods, however many events in NeoForge still rely on them.

If you use this annotation for some events, we encourage you to use a custom `enum` type instead,
as they are clearer to users of your API.

If you are a user of only the `getResult` and `setResult` methods, there is nothing for you to do.

### Other changes
- The Forge bus will not allow listeners to events that implement `IModBusEvent` anymore.
This should prevent subscribing to the wrong event bus.
- Removal of the subclass transformer:
Previously, the no-arguments constructor of an event subclass had to be `public`.
This is no longer the case - you can now make such constructors `protected`, package-private or `private` if you want to.
- `Event#getPhase` and `Event#setPhase` were removed.
- `@Event.HasResult` is now checked when calling `Event#setResult`. `Event#hasResult` and `Event#getResult` are now final.
- `EventListenerHelper` was removed from the API.
- `IEventListener`s use `toString` for human-readable description (`listenerName` was removed).
- Performance improvement: `isCanceled` checks are automatically removed for non-cancelable events.

[^1]: Not before NeoForge 20.3, don't worry.