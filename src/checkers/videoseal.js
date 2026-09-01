import * as ort from 'onnxruntime-web';
import sharp from 'sharp';
import { openAsBlob } from 'node:fs';

class VideosealAnalysis {
  constructor(flagged, confidence, message) {
    this.flagged = flagged
    this.confidence = confidence
    this.message = message
  }
}

async function runInference(imageFloat32Array, height, width, model) {
  const session = await ort.InferenceSession.create(model);

  const inputTensor = new ort.Tensor(
    'float32',
    imageFloat32Array,
    [1, 3, height, width]
  );

  const feeds = { imgs: inputTensor };

  const results = await session.run(feeds);

  return results.predictions;
}

async function blobToFloat32Array(file, targetWidth, targetHeight) {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const { data } = await sharp(inputBuffer)
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

  const channelSize = targetWidth * targetHeight;
  const float32Array = new Float32Array(3 * channelSize);


  for (let i = 0; i < channelSize; i++) {
     float32Array[i] = data[i * 3] / 255.0;                   // Red
     float32Array[channelSize + i] = data[i * 3 + 1] / 255.0;   // Green
     float32Array[channelSize * 2 + i] = data[i * 3 + 2] / 255.0; // Blue
   }

  return float32Array;
}


function isFlagged(output) {
  const confidence = output[0];

  const predictions = Array.from(output).slice(1, 257)
  const message = predictions.map(v => v > 0 ? 1 : 0)
  var flagged
  if (confidence > 0.5) {
    flagged = true
  } else {
    flagged = false
  }

  return new VideosealAnalysis(flagged, confidence, message)
}

async function imageAnalysis(file) {
  const image = await blobToFloat32Array(file, 256, 256)

  const predictions = await runInference(image, 256, 256, "../models/videoseal/videoseal.onnx")

  return isFlagged(predictions.cpuData);
}

const firstAnalysis = await imageAnalysis(await openAsBlob("/home/robin-brams/Documents/Code/slover/testfiles/image/videoseal.jpg"))
// console.log(analysis)

// console.log(analysis.message.join(""))
console.log(firstAnalysis.flagged)
console.log(firstAnalysis.confidence)

const secondAnalysis = await imageAnalysis(await openAsBlob("/home/robin-brams/Documents/Code/slover/testfiles/image/notai.png"))
console.log(secondAnalysis.flagged)
console.log(secondAnalysis.confidence)
