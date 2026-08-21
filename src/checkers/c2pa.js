import { Reader } from '@contentauth/c2pa-node';

// The class returned when analysing a media.
// If flagged is true, the content is likely to be ai generated
// The manifest is the json c2pa data. If there is none, it is undefined.
class C2PACheck {
  constructor(flagged, manifest) {
    this.flagged = flagged
    this.manifest = manifest
  }
}

// The function used to analyse a media 
// Returns C2PACheck class 
export async function c2paCheck(file) {
  const buffer = await file.arrayBuffer();
  const reader = await Reader.fromAsset({
    buffer: new Uint8Array(buffer),
    mimeType: file.type,
    length: file.size,
  });

  let manifest

  try {
    manifest = reader.getActive()
  }
  catch (TypeError) {
    return new C2PACheck(false, undefined)
  }

  // Tries to find a digitalSourceType, which tells what created or edited the image 
  const digitalSourceType =
    manifest?.assertions?.[0]?.data?.actions?.digitalSourceType ??
    manifest?.assertions?.[0]?.data?.actions?.[0]?.digitalSourceType ??
    null;

  // Checks if digitalSourceType is an AI tool
  if (digitalSourceType != null) {
    if (digitalSourceType == "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" | digitalSourceType == "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia") {
      return new C2PACheck(true, manifest)
    }
  } else {
    return new C2PACheck(false, manifest)
  }
}
