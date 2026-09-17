"""
Batch-exports every collection in the current Blender scene to its own .glb file.

Why this exists: after batch-importing a folder of Arma 3 models with the
"Arma 3 Object Builder" addon's built-in P3D batch importer, each imported
model ends up as its own Collection in the scene. This script loops over
those collections and exports each one as a separate, ready-to-upload .glb —
so you convert a whole folder of weapons/gear in one run instead of
exporting models one by one by hand.

Usage
-----
1. In Blender, batch-import your debinarized .p3d files:
   Text Editor -> Templates -> Object Builder -> "P3D batch importer",
   point it at the folder of _mlod.p3d files, run it. Each model becomes
   its own Collection.
2. Clean up each collection as usual (delete/hide Shadow, Geometry, Point
   cloud, ViewGunner/ViewPilot LODs — keep only the LOD0 visual mesh you
   want on the site), and make sure materials/textures are applied.
3. Open the Scripting workspace, load this file (or paste its contents),
   set OUTPUT_DIR below, and run it (Alt+P, or the ▶ Run button).
4. Upload the resulting .glb files through /admin on the site.

Command-line alternative (no need to open the Blender UI at all):
    blender your_scene.blend --background --python blender_batch_export_glb.py

Requires Blender 3.x+ (ships its own Python — run this from inside Blender,
not with a system `python`).
"""

import re
from pathlib import Path

import bpy

# EDIT THIS: where the .glb files should be written.
OUTPUT_DIR = Path(r"C:\arma3-models-export")

# Collections to skip (Blender's default "Scene Collection" root, plus
# anything you don't want exported — add names here as needed).
SKIP_COLLECTIONS = {"Scene Collection"}


def safe_filename(name: str) -> str:
    """Turn a Blender collection name into a safe file name (matches the
    slug rules the site's admin panel expects for weapon/option ids)."""
    name = name.strip().lower()
    name = re.sub(r"[^a-z0-9]+", "-", name)
    return re.sub(r"^-+|-+$", "", name) or "model"


def export_collection(collection: bpy.types.Collection, output_path: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")

    mesh_objects = [obj for obj in collection.all_objects if obj.type == "MESH"]
    if not mesh_objects:
        print(f"  skip '{collection.name}': no mesh objects")
        return

    for obj in mesh_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objects[0]

    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        use_selection=True,
        export_format="GLB",
        export_apply=True,  # bake modifiers, so LOD/mirror setups export correctly
        export_yup=True,  # glTF convention; matches what @react-three/fiber expects
    )
    print(f"  wrote {output_path}")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    collections = [c for c in bpy.data.collections if c.name not in SKIP_COLLECTIONS]
    if not collections:
        print("No collections found — did the P3D batch importer run first?")
        return

    print(f"Exporting {len(collections)} collection(s) to {OUTPUT_DIR}")
    for collection in collections:
        filename = safe_filename(collection.name) + ".glb"
        export_collection(collection, OUTPUT_DIR / filename)

    print("Done. Upload the .glb files from", OUTPUT_DIR, "through /admin on the site.")


if __name__ == "__main__":
    main()
