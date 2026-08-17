import { Reader } from '@contentauth/c2pa-node';
import { readFileSync } from 'fs';
import mime from 'mime';

class C2PACheck {
  constructor(flagged, manifest) {
    this.flagged = flagged
    this.manifest = manifest
  }
}

export async function checkFile(path) {
  const buffer = readFileSync(path);
  const mimeType = mime.getType(path)
  const reader = await Reader.fromAsset({
    buffer: buffer,
    mimeType: mimeType,
    lenght: buffer.byteLength,
  });
  try {
    return new C2PACheck(true, reader.getActive())
  }
  catch (TypeError) {
    return new C2PACheck(false, undefined)
  }
}
