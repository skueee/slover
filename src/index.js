import { c2paCheck } from "./checkers/c2pa.js"

// Image analysis
export class ImageAnalysisResult {
  constructor(c2pa) {
    this.c2pa = c2pa
  }

  get getFlaggedList() {
    const result = []
    if (this.c2pa.flagged == true) { result.push("c2pa") }

    return result
  }

  get getFlaggedCount() {
    const result = 0
    if (this.c2pa.flagged == true) { result++ }
  }

  get isFlagged() {
    if (this.c2pa.flagged == true) {
      return true
    } else {
      return false
    }
  }

  get authorsList() {
    const result = []
    if (this.c2pa.flagged == true) {
      result.push(this.c2pa.manifest.signature_info.issuer)
    }
    return result
  }
}

export async function imageAnalysis(file) {
  const c2pa = await c2paCheck(file)
  return new ImageAnalysisResult(c2pa)
}


// Video analysis
export class VideoAnalysisResult {
  constructor(c2pa) {
    this.c2pa = c2pa
  }

  get getFlaggedList() {
    const result = []
    if (this.c2pa.flagged == true) { result.push("c2pa") }

    return result
  }

  get getFlaggedCount() {
    const result = 0
    if (this.c2pa.flagged == true) { result++ }
  }

  get isFlagged() {
    if (this.c2pa.flagged == true) {
      return true
    } else {
      return false
    }
  }

  get authorsList() {
    const result = []
    if (this.c2pa.flagged == true) {
      result.push(this.c2pa.manifest.signature_info.issuer)
    }
    return result
  }
}

export async function videoAnalysis(file) {
  const c2pa = await c2paCheck(file)
  return new VideoAnalysisResult(c2pa)
}
