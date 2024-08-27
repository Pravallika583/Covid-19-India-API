const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())
let db = null

const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'covid19India.db'),
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started Successfully')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
initializeDbandServer()

//get list of all states

app.get('/states/', async (request, response) => {
  let query = 'Select * from state'
  let allQueries = await db.all(query)
  response.send(
    allQueries.map(eachItem => ({
      stateId: eachItem.state_id,
      stateName: eachItem.state_name,
      population: eachItem.population,
    })),
  )
})

//get with id

app.get('/states/:stateId', async (request, response) => {
  let {stateId} = request.params
  let query = `Select * from state where state_id = ${stateId};`
  let allQueries = await db.get(query)
  response.send({
    stateId: allQueries.state_id,
    stateName: allQueries.state_name,
    population: allQueries.population,
  })
})

//post a district in district table

app.post('/districts/', async (request, response) => {
  let details = request.body
  let {districtName, stateId, cases, cured, active, deaths} = details
  let query = `Insert into district (district_name, state_id, cases, cured, active, deaths) values
  ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`
  await db.run(query)
  response.send('District Successfully Added')
})

//get district details based on district Id

app.get('/districts/:districtId', async (request, response) => {
  let {districtId} = request.params
  let query = `Select * from district where district_id = ${districtId};`
  let allQueries = await db.get(query)
  response.send({
    districtId: allQueries.district_id,
    districtName: allQueries.district_name,
    stateId: allQueries.state_id,
    cases: allQueries.cases,
    cured: allQueries.cured,
    active: allQueries.active,
    deaths: allQueries.deaths,
  })
})

// delete based on district id

app.delete('/districts/:districtId', async (request, response) => {
  let {districtId} = request.params
  let query = `DELETE from district where district_id = ${districtId};`
  let allQueries = await db.get(query)
  response.send('District Removed')
})

//update based on district id

app.put('/districts/:districtId', async (request, response) => {
  let details = request.body
  let {districtId} = request.params
  let {districtName, stateId, cases, cured, active, deaths} = details
  let query = `Update district set district_name = '${districtName}', state_id = ${stateId}, cases = ${cases}, 
  cured = ${cured}, active = ${active}, deaths = ${deaths} where district_id = ${districtId};`
  await db.run(query)
  response.send('District Details Updated')
})

//get statistics of all cases

app.get('/states/:stateId/stats', async (request, response) => {
  let {stateId} = request.params
  let query = `Select sum(cases), sum(cured), sum(active), sum(deaths) from district where state_id = ${stateId};`
  let allQueries = await db.get(query)
  console.log(allQueries)
  response.send({
    totalCases: allQueries['sum(cases)'],
    totalCured: allQueries['sum(cured)'],
    totalActive: allQueries['sum(active)'],
    totalDeaths: allQueries['sum(deaths)'],
  })
})

// get stateName based on district id

app.get('/districts/:districtId/details/', async (request, response) => {
  let {districtId} = request.params
  let query = `Select state_id from district where district_id = ${districtId};`
  let idQueries = await db.get(query)
  console.log(idQueries)
  let nameQuery = `Select state_name from state where state_id = ${idQueries.state_id};`
  let allQueries = await db.get(nameQuery)
  console.log(allQueries)
  response.send({
    stateName: allQueries.state_name,
  })
})

module.exports = app;
