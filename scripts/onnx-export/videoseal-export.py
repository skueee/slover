import os
import shutil
import sys

from git import Repo
import onnx
import onnxscript
import requests
import torch


def directory_check():
    print("Checking directories")
    if not os.path.isdir('src'):
        print("Please run this script from the root of the project")
        sys.exit(1)

    if not os.path.isdir('src/models'):
        print("   Warning : models folder does not exist\n   Creating folder")
        os.mkdir("src/models")

    if not os.path.isdir('src/models/videoseal'):
        print("   Warning : videoseal folder does not exist\n   Creating folder")
        os.mkdir("src/models/videoseal")

def clone_repo():
    print("Downloading videoseal")
    print("   Cloning repo")
    Repo.clone_from("https://github.com/facebookresearch/videoseal", "scripts/onnx-export/temp/videoseal")
    print("   Extracting the right files")
    shutil.move("scripts/onnx-export/temp/videoseal/videoseal", "scripts/onnx-export/videoseal")
    shutil.move("scripts/onnx-export/temp/videoseal/configs", "scripts/onnx-export/videoseal/configs")
    print("   Cleaning up")
    shutil.rmtree("scripts/onnx-export/temp/videoseal")

def model_export():
    print("Exporting model")
    print("   Loading model")
    import videoseal
    model = videoseal.load("videoseal")
    detector = model.detector
    detector.eval()

    print("   Exporting model")
    dummy_imgs = torch.randn(1, 3, 256, 256)

    return torch.onnx.export(
            detector,
            (dummy_imgs,),
            "src/models/videoseal/videoseal.onnx",
            input_names=["imgs"],
            output_names=["predictions"],
            dynamic_axes={
                "imgs": {0: "batch", 2: "height", 3: "width"},
                "prediction": {0: "batch"}
            },
            opset_version=18
        )

def onnx_check():
    print("Checking the model")
    print("   Loading the model")
    onnx_model = onnx.load("src/models/videoseal/videoseal.onnx")
    print("   Checking")
    onnx.checker.check_model(onnx_model)

def cleanup():
    print("Final cleanup")
    shutil.rmtree("scripts/onnx-export/temp")
    shutil.rmtree("scripts/onnx-export/videoseal")
    shutil.rmtree("ckpts")

if __name__ == "__main__":
    directory_check()
    clone_repo()
    model_export()
    onnx_check()
    cleanup()
    print("Done !")
