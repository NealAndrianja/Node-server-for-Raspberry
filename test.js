const {InfluxDB, Point} = require('@influxdata/influxdb-client')
const dotenv = require("dotenv")

dotenv.config() 

const token = process.env.INFLUXDB_TOKEN
const url = 'http://192.168.1.200:8086'

const client = new InfluxDB({url, token})
console.log(client)
let org = `Box Domotique`
let bucket = `smarthome`

let writeClient = client.getWriteApi(org, bucket, 'ns')
console.log(writeClient)
for (let i = 0; i < 5; i++) {
  let point = new Point('measurement1')
    .tag('tagname1', 'tagvalue1')
    .intField('field1', i)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 500)
}



let queryClient = client.getQueryApi(org)
let fluxQuery = `from(bucket: "smarthome")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")`

queryClient.queryRows(fluxQuery, {
  next: (row, tableMeta) => {
    const tableObject = tableMeta.toObject(row)
    console.log(tableObject)
  },
  error: (error) => {
    console.error('\nError', error)
  },
  complete: () => {
    console.log('\nSuccess')
  },
})

