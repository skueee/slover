import { Reader } from '@contentauth/c2pa-node';

class C2PACheck {
  constructor(flagged, manifest) {
    this.flagged = flagged
    this.manifest = manifest
  }
}

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

  const digitalSourceType =
    manifest?.assertions?.[0]?.data?.actions?.digitalSourceType ??
    manifest?.assertions?.[0]?.data?.actions?.[0]?.digitalSourceType ??
    null;

  if (digitalSourceType != null) {
    if (digitalSourceType == "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" | digitalSourceType == "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia") {
      return new C2PACheck(true, manifest)
    } else {
      return new C2PACheck(false, manifest)
    }
  } else {
    return new C2PACheck(false, manifest)
  }
}
