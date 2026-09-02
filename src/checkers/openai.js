import { openAsBlob } from 'fs'

class OpenAIAnalysis {
  constructor(status, c2pa, synthid, model, response) {
    this.status = status  // The status of the request (200 if successful)
    this.c2pa = c2pa  // Check if the detector flagged C2PA
    this.synthid = synthid  // Check if the detector flagged synthid
    this.model = model  // If available, the model used to generate the image
    this.response = response  // The full response
    if (c2pa || synthid) { this.flagged = true } else { this.flagged = false }  // Check if c2pa or synthid are flagged
  }
}


// Analysis method
async function openaiAnalysis(file, api_key) {
  // Formdata with the file
  var formdata = new FormData()
  formdata.append("file", file)

  // Request
  var response = await fetch("https://api.openai.com/v1/content_provenance_checks", {
    method: "post",
    headers: {
      "Authorization": "Bearer " + api_key,
    },
    body: formdata
  })

  if (!response.ok) {
    return new OpenAIAnalysis(response.status, null, null, null, null)  // If the request is not successful :(
  }

  var json = await response.json()
  return new OpenAIAnalysis(
    reponse.status,  // Request status
    json.results[0].outcome == "detected",  // C2PA flagged
    json.results[1].outcome == "detected",  // Synthid flagged
    json.results[0].model,  // Model infos (if any)
    json  // Full response
  )
}
