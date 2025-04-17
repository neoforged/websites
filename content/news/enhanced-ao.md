---
title: "A New Block Model Lighting Pipeline"
date: 2025-04-18T00:20:00+02:00
categories:
- News
author: technici4n
summary: |
    This blog post explains how smooth lighting works in Minecraft,
    and how the new block model lighting pipeline introduced in NeoForge 21.5.30-beta improves it.
---

We have a new block model lighting pipeline in NeoForge **21.5.30-beta**
which replaces the previous experimental pipeline.
It can be enabled using the `enhancedLighting` client config option, which defaults to `true`.

The goal of this blog post is to explain the general workings of block lighting,
the shortcomings of vanilla's implementation, and how the new pipeline fixes them.
This blog post will be useful in 3 different ways:
- To give an overview of how smooth lighting works, for anyone who is curious about it.
- To help modders understand how to adjust the properties of their blocks to make the lighting more smooth.
- And finally, to provide a list of edge case for future development of smooth lighting.

## The existing pipelines
There are multiple implementations of block model lighting available in Minecraft and mods:
- **Vanilla**: The lighting pipeline in vanilla Minecraft, which has been around for a long time and is well known. The basic algorithm is sound, however there are many issues, as you will learn by reading the rest of this blog post.
- **(Neo)Forge's experimental lighting pipeline**: This is an old lighting pipeline that has been available in Forge for a long time, originally written by Fry I believe. It is not well understood by the current maintainers, has not been maintained in a while, and has been noticed to cause various lighting issues. It is disabled by default, and was removed from NeoForge in 21.5.30-beta.
- **Indigo**: The lighting pipeline implemented inside of Fabric API, originally written by Grondag around 6 years ago. It has since received some improvements thanks mostly to Pepper and (a little bit) me. It is based on vanilla's rendering pipeline, but fixing many of its issues. It has a few lighting modes, the most important being the "enhanced" mode which is supposed to be the most correct, but is off by default due to noticeable differences with vanilla.
- **Sodium**: Sodium's lighting pipeline is also based on vanilla's rendering pipeline. It was mostly written by Jellysquid and Pepper, and is very similar to Indigo's enhanced pipeline.
- **NeoForge's new enhanced lighting pipeline**: This is the new lighting pipeline that we are introducing in NeoForge. It is based on the vanilla pipeline, with improvements from Indigo and Sodium applied to it. Most notably, inset faces are handled differently than in Indigo and Sodium, which introduces less artifacts in my testing. (See the section about inset faces below.)

## What is block model lighting anyway?
In Minecraft, each block position gets assigned a _block_ light level between 0 and 15 based on the light sources such as torches around it.
Each position also gets assigned a _sky_ light level between 0 and 15 based on access to the sky.
For the rest of this blog post, we will always talk about "the" light level,
but keep in mind that it always has both a _block_ and a _sky_ component.

So on the one hand each block position gets one light level.
On the other hand, a block model may be made of multiple quads, and each quad may be rendered at a different position and with different orientation.

The task of the lighting pipeline is to assign a light level to each vertex of each quad,
based on the light levels available at each block position.

| ![quads with question marks in the corners](quads-question-marks.png) |
|:--:|
| *In this image, the two quads of the stairs block facing the camera are highlighted, one in blue and one in orange. The task of the lighting pipeline is to resolve the light level of each vertex, indicated by a question mark **?** in the corners of the quads on the image.* |

The key thing is this: **To avoid seams between quads, all quad vertices that are at the same position in the world should have the same light level.** As for pixels between the quad vertices, the GPU will interpolate the light level between the vertices, similarly to how it interpolates texture coordinates.

## Flat lighting
Let us first discuss what happens when smooth lighting is disabled. This is also know as "flat" shading.
Each quad can choose whether it wants to use smooth or flat lighting. It is also possible to force flat lighting for all the quads in the world by setting the _Smooth Lighting_ option to _OFF_ in the video settings.

Flat lighting is very simple: query the light level of a block position, then give it to all vertices of the quad.
However look at the stairs block in the image below.
The blue quad has a different light level than the pink quad, even though they both belong to the same stairs block!

| ![stairs and slab with flat ao](stairs-slab-flat-ao.png) |
|:--:|
| *Stairs block and slab block next to a torch. Here, smooth lighting was disabled in the video settings. Notice how the blue and pink quads have different light levels!* |

What is happening is that we need to decide if we want to query the light level:
1. **Inside** the block. This is the case for the blue quad.
1. **Outside** the block. This is the case for the pink quad.

This is how vanilla decides where to query the light level:
- If the quad has a cull face, the light level is queried outside of the block, in the direction of the cull face.
- If the quad has no cull face but resides on the edge of a block, the light level is queried outside of the block, in the direction of the quad normal.
- Otherwise, the light level is queried inside the block.

As a special case, if `isCollisionShapeFullBlock` is `true` for a block,
all quads without a cull face that are axis-aligned are considered on the edge of the block,
and will therefore receive the light level outside of the block.
The intuition here is that the block is a full cube, and therefore the light level should be queried outside of it.

This works reasonably, so the enhanced lighting pipeline does not change this behavior.

Besides the light level, each quad receives a slight shade which depends on its orientation.
This makes the different sides of a block clearly stand out from each other.
In vanilla, this shade depends on the closest axis to the quad normal.
This is a problem for quads that are not axis-aligned, as shown on the picture below.

The enhanced lighting pipeline instead combines the shade of various axes,
weighted using components of the quad normal:

| ![flat ao sloped block with vanilla](sloped-flat-vanilla.png) | ![flat ao sloped block with enhanced](sloped-flat-enhanced.png) |
|:--:|:--:|
| *Framed slope block using flat vanilla lighting.* | *Framed slope block using flat enhanced lighting.* |

## Smooth block face lighting
Let's now discuss smooth lighting. To begin with, we will only consider a full block face, such as the stone face on the following picture:

| ![center, edges, corners](center-edges-corners.png) |
|:--:|
| *To compute smooth lighting, we use not only the light at the center, but also at the 4 edges and 4 corners. In this case, the light is always on the plane above the stone block.* |

The basic idea of the algorithm is quite simple: compute the light values on a 3x3 grid around the face, and then for each vertex combine the center light, the 2 edge lights and the corner light.
For the stone quad:
- **Top-left corner light**: Combine `center`, `edge0`, `edge3` and `corner1`.
- **Top-right corner light**: Combine `center`, `edge1`, `edge3` and `corner3`.
- **Bottom-left corner light**: Combine `center`, `edge0`, `edge2` and `corner0`.
- **Bottom-right corner light**: Combine `center`, `edge1`, `edge2` and `corner2`.

Since the stone quad is at the edge of the block, the light values are sampled outside of the block.
So in this case, `corner3` has a light level of 0 because it is a full (grass) block,
and all the other light levels are 15 because of sky access.

### How to combine (aka. "mix") light levels?
So how do we combine the light levels? In all cases, we have one center, two edges, and one corner to combine.
Simply taking an average does not work because opaque blocks have a light level of 0,
which we do not want to include in the average.

Vanilla takes the average _after replacing any 0 with the center light level_.
Unfortunately, this has two issues:
1. Values of 0 are always ignored under the assumption that they come from solid blocks. However, light levels of 0 can also appear naturally, for example in the middle of an unlit cave, and in that case they should not be ignored.
2. It gives special treatment to the center light level compared to the edges and corner.
  When we later compute the light for a vertex at the same position but on a different block,
  the 4 light levels will be the same but which is the center light level will be different.
  This can create seams between quads that are on different blocks, because the combined light value at a vertex can be different even though it is built out of the 4 same values.
  An example is shown in the image below.

| ![seams due to light mixing in vanilla](light-mixing-seams-vanilla.png) | ![no seams with enhanced](light-mixing-seams-enhanced.png) |
|:--:|:--:|
| *Seams caused by the vanilla mixing formula.* | *No seams with the enhanced lighting mixing formula.* |

Without going into the details, the mixing formula implemented in the enhanced lighting pipeline fixes both of these issues:
1. Rather than ignoring values of 0, it uses information about whether the light level came from a solid block or not.
2. All 4 light levels it receives are treated equally. Unlike in vanilla, there is no special treatment for the center light level.

### Corner checks
One tweak is made to the above algorithm, to avoid light from corners leaking through solid blocks.
If both edges are solid blocks, the corner light level is ignored, and instead the light level of one of the edges is used.

Vanilla implements this check, however there is a bug in the implementation. The blocks that are checked are off by one block in the direction of the face. In the following image, the corner light level is not ignored even though it should be:
| ![corner vanilla](corner-vanilla.png) |
|:--:|
| *Using the vanilla lighting pipeline, a bit of light from the magma cube is leaking through the two stone blocks on the left. This might be easier to see by comparing to the same scene rendered using the enhanced lighting pipeline below.* |

Since vanilla is checking the wrong blocks, seams can appear as in this example:
| ![corner vanilla seams](corner-vanilla-seams.png) |
|:--:|
| *The edge checks are off-by-one in the vanilla lighting pipeline, causing some seams on the left blocks.* |

The enhanced lighting pipeline fixes this bug by checking the correct blocks:
| ![corner enhanced](corner-enhanced.png) |
|:--:|
| *Notice how the two stone blocks are blocking off the light from the magma block. This is using the enhanced smooth lighting pipeline.* |

Another vanilla bug is that when the corner is blocked, it will use the light level of an edge block that is not adjacent to the corner in 2/4 of the cases. The enhanced lighting pipeline also fixes this bug.

Preventing light from leaking through solid blocks is important, however it can cause discontinuities because it ignores the light level of the corner block. The solution is to make sure that they can never be observed. If a block is considered opaque, i.e. if `state.isViewBlocking(...)` is `true` and `state.getLightBlock(...)` is not `0`, all its visible quads should be on the edge of the block, not inside it! Otherwise, seams can appear.

## Other quad shapes
The information above is valid for full block faces, i.e. one of the 6 faces of a cube.
Except for a few details, you might now be able to understand the [`FullFaceCalculator`](https://github.com/neoforged/NeoForge/blob/1.21.x/src/client/java/net/neoforged/neoforge/client/model/ao/FullFaceCalculator.java) class from the enhanced lighting pipeline,
which implements the above algorithm.

There are other possible quad shapes that we will now discuss. They are handled based on the full face results, so it was important to discuss full faces first.

### Inset faces
An inset face is a full block face that is pushed inside a block. In other words, it is an axis-aligned quad that has the size of a block, but is located inside a block. An example is the top face of a slab block, which is inset by `0.5` blocks.

When computing smooth lighting for full faces, the light levels are all sampled **outside** of the block.
This means that the center light level is queried right outside of the block being rendered, and then the edges and corners are also moved accordingly.

To compute inset faces, we apply the same algorithm as for full faces, but we use the **inside** positions instead of the **outside** positions when computing the light. This means that the center light level is queried inside the block being rendered, and the edges and corners are queried accordingly. This is similar to how the light level is either computed **inside** or **outside** the block for flat lighting.

### Inset faces: Comparison to Indigo
In vanilla and the enhanced lighting pipeline, an inset quad will always use the **inside** light levels regardless of how deep it is inset.
As of writing, enhanced Indigo will instead perform a linear interpolation between the inside and outside light levels based on the inset depth.
This sounds like a good idea in theory, however sampling outside of the block when computing an inset face can cause seams because of the corner checks described above.

| ![inset slabs with vanilla](inset-indigo-hybrid.png) | ![inset slabs with indigo enhanced](inset-indigo-enhanced.png) |
|:--:|:--:|
| _Inset slabs using only the inside light. **Indigo hybrid, similar to vanilla and NeoForge's enhanced lighting.**_ | _Inset slabs using 50% inside light and 50% outside light. **Indigo enhanced, which looks worse in this case.**_ |

Linear interpolation between the inside and outside light levels also breaks the dark shade of path blocks:

| ![path block with vanilla](path-indigo-hybrid.png) | ![path block with indigo enhanced](path-indigo-enhanced.png) |
|:--:|:--:|
| _Path block using only the inside light. **Indigo hybrid, similar to vanilla and NeoForge's enhanced lighting.**_ | _Path block using 1/16 inside light and 15/16 outside light. **Indigo enhanced, which looks worse in this case.**_ |

### Center light
For some reason I don't understand, vanilla will sometimes sample outside of the block for the center light level of inset faces (when `state.isSolidRender(...)` is `false` for the outside center). This can cause some artifacts, such as the one shown here with a slab below an active sculk sensor:

| ![slab below sculk sensor with vanilla](slab-sculk-vanilla.png) | ![slab below sculk sensor with enhanced](slab-sculk-enhanced.png) |
|:--:|:--:|
| *Using the vanilla lighting pipeline. The seams below the sculk sensor are due to sampling the center light outside for some reason. The seams on the stone blocks are due to the mixing formula (see above).* | *Using the enhanced lighting pipeline, which fixes both issues.* |

The enhanced lighting pipeline does sample the center light level differently than the edges and corners, so it does not have this problem.

### Partial faces
Partial faces are quads that are axis-aligned, but that are smaller than a full block face. To compute smooth lighting for partial faces, we first compute the corresponding full or inside face, then we perform interpolation based on the positions of the vertices of the partial face.

Vanilla only performs this interpolation for partial faces, and because of the specific implementation I am not sure that it would work for faces that have an unusual shape, for example a diamond (square rotated by 90 degrees) shape. NeoForge enhanced lighting will always interpolate based on individual vertex positions, even for full faces. This ensures that quads will look correct regardless of the vertex position and order.

For example in the following picture, we first compute the red square, then we use bilinear interpolation to compute the light levels of the blue and orange quads:
| ![partial face with enhanced](partial-face.png) |
|:--:|
| *We first compute the light levels at the 4 corners of the red square. Then we interpolate to compute the light levels at the 4 corners of the blue and orange quads.* |

### Irregular faces
Irregular faces are faces that are not axis-aligned. Vanilla will compute the closest axis, and then treat the irregular face like an inset partial face. As shown in the picture below, this really does not work. The enhanced pipeline will instead project the face onto the 3 axis, compute the light level for each axis, and then recombine the 3 light levels based on the components of the face normal vector. This is similar to what is done for flat lighting.

The results speak for themselves in the following scene, built out of Framed Blocks with irregular faces:
| ![irregular faces with vanilla](irregular-vanilla.png) | ![irregular faces with enhanced](irregular-enhanced.png) |
|:--:|:--:|
| *Using the vanilla lighting pipeline.* | *Using the enhanced lighting pipeline.* |

## Common issues
I would like to add a section to this post that will collect common problems that modders can encounter with smooth lighting of their own blocks, and how to fix them.
So if you have a block that has a lighting issue, please get in touch with us on Discord, and I will try to help you fix it.
Once I have a list of common issues, I hope to add them to this blog post.

## Conclusion
This concludes the explanation of the enhanced lighting pipeline. I hope that you enjoyed this blog post and learned something new about block model lighting in Minecraft.

You can find the code for the enhanced lighting pipeline in the NeoForge repository. The two most important classes are:
- [`FullFaceCalculator`](https://github.com/neoforged/NeoForge/blob/1.21.x/src/client/java/net/neoforged/neoforge/client/model/ao/FullFaceCalculator.java), which implements the full face lighting algorithm.
- [`EnhancedAoRenderStorage`](https://github.com/neoforged/NeoForge/blob/1.21.x/src/client/java/net/neoforged/neoforge/client/model/ao/EnhancedAoRenderStorage.java), which handles the geometry of the quads. The heart of the computation happens in the `calculateAxisAligned` and `calculateIrregular` methods.

Finally, I want to thank the modders who also helped me design the enhanced pipeline with their feedback, or who wrote the previous pipelines that provided most of the inspiration.
Special thanks to Pepper and XFact in particular for the extensive discussions that we had.

### Notes
- This blog post does not discuss the shade that full blocks cast onto adjacent blocks.
  It is similar to the light level, except that the mixing formula is simpler: just average the values.
- This post does not discuss fractional light values. The block and sky light levels assigned to blocks are integers between 0 and 15, however the light levels given to each vertex can also have an additional fractional component whose values can be 0/16, 1/16, ..., 15/16.