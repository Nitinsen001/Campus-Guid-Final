import pygltflib

def list_meshes(path):
    try:
        gltf = pygltflib.GLTF2().load(path)
        print("=== Meshes in GLB ===")
        for mesh in gltf.meshes:
            print(f"Mesh: {mesh.name}")
        print("\n=== Nodes in GLB ===")
        for node in gltf.nodes:
            if node.name:
                print(f"Node: {node.name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_meshes("/Users/chinmayjoshi/Desktop/Smartracker/3dmodel.glb")
