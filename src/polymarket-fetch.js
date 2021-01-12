/* Imports */
import fs from 'fs'
import axios from "axios"

/* Definitions */
let graphQLendpoint = 'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket3'
let units = 10**6

/* Support functions */
async function fetchAllContractInfo(){ // for info which the polymarket graphql API
  let data = fs.readFileSync("./data/polymarket-contract-list.json")
  let response = JSON.parse(data)
  return response
}

async function fetchAllContractData(){
  let daysSinceEra = Math.round(Date.now()/(1000*24*60*60))-2
  let response  = await axios({
    url: graphQLendpoint,
    method: 'POST',
    headers: ({ 'Content-Type': 'application/json' }),
    data: JSON.stringify(({ query: `
      {
          fixedProductMarketMakers(first: 300
          where: {
          lastActiveDay_gt: ${daysSinceEra}
          }){
            id
            creator
            creationTimestamp
            fee
            tradesQuantity
            buysQuantity
            sellsQuantity
            lastActiveDay
            outcomeTokenPrices
            outcomeTokenAmounts
            liquidityParameter
            collateralBuyVolume
            collateralSellVolume
            conditions {
              outcomeSlotCount
            }
        }
      }
      ` 
    })),
  })
  .then(res => res.data)
  .then(res => res.data.fixedProductMarketMakers)  
  //console.log(response)
  return response
}

async function fetch_all(){
  let allData = await fetchAllContractData()
  let allInfo = await fetchAllContractInfo()
  
  let combinedObj = ({})
  for(let info of allInfo){
    let address = info.address
    let addressLowerCase = address.toLowerCase()
    //delete info.history
    combinedObj[addressLowerCase] = {
      title: info.title,
      url: info.url, 
      address: info.address
    }
  }
  for(let data of allData){
    let addressLowerCase = data.id
    if(combinedObj[addressLowerCase] != undefined){
      //console.log(addressLowerCase)
      let obj = combinedObj[addressLowerCase]
      let numforecasts = data.tradesQuantity
      let isbinary = Number(data.conditions[0].outcomeSlotCount) == 2
      let tradevolume = (Number(data.collateralBuyVolume) + Number(data.collateralSellVolume))/units
      let liquidity =  Number(data.liquidityParameter)/units
      let percentage = Number(data.outcomeTokenPrices[0])*100
      combinedObj[addressLowerCase] = {
        Title: obj.title,
        URL: obj.url, 
        Platform: "PolyMarket",
        "Binary question?" : isbinary,
        "Percentage": isbinary?(percentage.toFixed(4) + "%"):"none",
        "# Forecasts": Number(data.tradesQuantity).toFixed(2)
        /*liquidity: liquidity.toFixed(2),
        tradevolume: tradevolume.toFixed(2),
        address: obj.address*/
      }
    }
  }
  let result = Object.values(combinedObj)
  //console.log(result)
  return result
}

/* Body */
export async function polymarket(){
  let result = await fetch_all()
  console.log(result)
  //console.log(result)
  let string = JSON.stringify(result,null,  2)
  fs.writeFileSync('./data/polymarket-questions.json', string);
  console.log("Done")
}
