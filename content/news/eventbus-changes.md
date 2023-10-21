---
title: "Event system changes in NeoForge 20.2"
date: 2023-10-21T18:30:00+02:00
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

### Updated `@SubscribeEvent` semantics
We changed some details about how `@SubscribeEvent` methods are detected when an object or class is `register`ed to the an event bus:

This the new behavior for registering objects or classes to new behavior is as follows:
- All `@SubscribeEvent` methods (regardless of visibility) in the target object are registered. There is no inheritance of `@SubscribeEvent` methods anymore, and private methods can now be used.
- Superclasses or superinterfaces of the registered class are not allowed to have any declared method with `@SubscribeEvent`. This prevents mistakes where a developer would assume that inheritance works.
- An error will be thrown if any `@SubscribeEvent` method has mismatching static-ness: registrations with a `Class` must be `static`, and registrations with an object must be non-`static`. This prevents mistakes where `static` is forgotten or unnecessary.
- An error will be thrown if no `@SubscribeEvent` method exists. This prevents forgetting the `@SubscribeEvent` annotation.

### `abstract` events cannot be listened to anymore
`abstract` events cannot be listened to anymore.
This should help prevent mistakes where a developer would accidentally listen to a superclass,
for example by listening to `SomeEvent` instead of `SomeEvent.Pre`.
All the superclasses of `abstract` events must now be abstract themselves.

A number of NeoForge events were made `abstract` to guard against developer mistakes.

### Updated mod bus semantics
The Forge bus will not allow listeners to events that implement `IModBusEvent` anymore.
This should prevent subscribing to the wrong event bus.

Additionally, events dispatched on the mod busses via `ModLoader` such as all the
NeoForge registration events now respect event priority across different busses.
(For example, a listener registered with `EventPriority.LOW` will
always run before listeners from other mods registered with `EventPriority.NORMAL`.)

### More `addListener` overloads
We added a few convenient overloads for lambda registration with `IEventBus#addListener`. For example, the following is now possible:
```java
bus.addListener(SomeEvent.class, event -> {
    // Listener code here.
});
```

### Generic events are deprecated for removal
Generic events are deprecated for removal, and will be removed in the future[^1]. We encourage modders to move away from them as soon as possible. NeoForge is still using them for the `AttachCapabilitiesEvent` only. We will address this in the capability rework.

### Event results are being phased out
For now, only the `@Event.HasResult` annotation is deprecated for removal.
We will eventually remove the `getResult()` and `setResult(result)` methods, however many events in NeoForge still rely on them.

If you use this annotation for some events, we encourage you to use a custom `enum` type instead,
as they are clearer to users of your API.

If you are a user of only the `getResult` and `setResult` methods, there is nothing for you to do.

## Other changes
- Removal of the subclass transformer:
Previously, the no-arguments constructor of an event subclass had to be `public`.
This is no longer the case - you can now make such constructors `protected`, package-private or `private` if you want to.
- `Event#getPhase` and `Event#setPhase` were removed.
- `@Event.HasResult` is now checked when calling `Event#setResult`. `Event#hasResult` and `Event#getResult` are now final.
- `EventListenerHelper` was removed from the API.
- `EventListener`s use `toString` for human-readable description (`listenerName` was removed).
- Performance improvement: `isCanceled` checks are automatically removed for non-cancelable events.
- `IEventListener` is renamed to `EventListener` and changed to an abstract class for performance reasons.
- The ModLauncher hooks were removed, greatly simplifying the implementation of the event bus.
- `IEventBusInvokeDispatcher` was removed.

[^1]: Not before NeoForge 20.3, don't worry.