/* Imports */
import { Parser, transforms } from 'json2csv'
import fs from 'fs'
import readline from "readline"

import {csetforetell} from "./csetforetell-fetch.js"
import {elicit} from "./elicit-fetch.js"
import {estimize} from "./estimize-fetch.js"
import {foretold} from "./foretold-fetch.js"
import {goodjudgment} from "./goodjudgment-fetch.js"
import {goodjudgmentopen} from "./goodjudmentopen-fetch.js"
import {hypermind} from "./hypermind-fetch.js"
import {ladbrokes} from "./ladbrokes-fetch.js"
import {metaculus} from "./metaculus-fetch.js"
import {polymarket} from "./polymarket-fetch.js"
import {predictit} from "./predictit-fetch.js"
import {omen} from "./omen-fetch.js"
import {smarkets} from "./smarkets-fetch.js"
import {williamhill} from "./williamhill-fetch.js"

/* Definitions */
let opts = {}
let json2csvParser = new Parser({ transforms:  [transforms.flatten()]});
//let parse = csv => json2csvParser.parse(csv);
// let sets = ["template", "elicit", "foretold", "metaculus", "predictit", "polymarket", "csetforetell", "givewellopenphil", "goodjudgment","goodjudmentopen", "omen", "hypermind", "smarkets", "williamhill", "ladbrokes", "xrisk"]
let sets = ["csetforetell", "elicit", "estimize", "foretold", "givewellopenphil", "goodjudgment","goodjudmentopen", "hypermind", "ladbrokes", "metaculus", "polymarket", "predictit", "omen", "smarkets", "williamhill", "xrisk"]
let suffix = "-questions"
let locationData = "./data/"
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* Support functions */
let getJSON = (set) => {
  let rawdata = fs.readFileSync(locationData + set + suffix + ".json")
  console.log(set)
  //console.log(rawdata)
  let data = JSON.parse(rawdata)
  return data
}
let csvfromjson = (json) => json2csvParser.parse(json)

let writefile = (data, set, suffix, filetype = ".csv") => {
  fs.writeFileSync(locationData + set + suffix + filetype, data)
}

let coverttocsvandmerge = () => {
  let merged = []
  for(let set of sets){
    let json = getJSON(set)
    //let csv = csvfromjson(json)
    //writefile(csv, set, suffix)
    merged = merged.concat(json)
    //console.log(merged)
  }
  let mergedprocessed = merged.map(element => ({...element, optionsstringforsearch: element.options.map(option => option.name).join(", ")}))
  writefile(JSON.stringify(mergedprocessed, null, 2), "metaforecasts", "", ".json")
  
  let preparedforcsv = []
  mergedprocessed.forEach(element => {
    preparedforcsv.push({
        "title": element.title,
        "description": element.description,
        "optionsstringforsearch": element.optionsstringforsearch
    })
  } )
  //console.log(preparedforcsv)
  
  let mergedcsv = csvfromjson(preparedforcsv)
  writefile(mergedcsv, "metaforecasts", "")
  console.log("Done")

}

async function whattodo(message,callback){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(message, (answer) => {
    rl.close();
    callback(answer)
  });
}

let executeoption = async (option) => {
  option = Number(option)
  switch (option) {
    case 1:
      csetforetell()
      break;
    case 2:
      elicit()
      break;
    case 3:
      estimize()
      break;
    case 4:
      foretold()
      break;
    case 5:
      goodjudgment()
      break;
    case 6:
      goodjudgmentopen()
      break;
    case 7:
      hypermind()
      break;
    case 8:
      ladbrokes()
      break;
    case 9:
      metaculus()
      break;
    case 10:
      omen()
      break;
    case 11:
      polymarket()
      break;
    case 12:    
      predictit()
      break;
    case 13:
      smarkets()
      break;
    case 14:
      williamhill()
    break;
    case 15:
      coverttocsvandmerge()
      break;
    case 16:
      await csetforetell()
      await elicit()
      //await foretold()
      await goodjudgment()
      await goodjudgmentopen()
      await hypermind()
      await ladbrokes()
      await metaculus()
      await omen()
      await polymarket()
      await predictit()
      await smarkets()
      await coverttocsvandmerge()
      break;
    default:
      console.log("Sorry, invalid case")
      break;
  }
}

/* BODY */
let whattodoMessage = `What do you want to do?
[1]: Download predictions from csetforetell
[2]: Download predictions from elicit
[3]: Download predictions from estimize
[4]: Download predictions from foretold
[5]: Download predictions from goodjudgment
[6]: Download predictions from goodjudgmentopen
[7]: Download predictions from hypermind
[8]: Download predictions from ladbrokes
[9]: Download predictions from metaculus
[10]: Download predictions from omen
[11]: Download predictions from polymarket
[12]: Download predictions from predictit
[13]: Download predictions from smarkets
[14]: Download predictions from William Hill
[15]: Merge jsons them into one big json (requires previous steps)
[16]: All of the above
Choose one option, wisely: #`

whattodo(whattodoMessage, executeoption)
