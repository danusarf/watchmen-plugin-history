var moment = require('moment');
require('dotenv').load({ silent: true });

const { Pool, Client } = require('pg');
const pool = new Pool({
    user: process.env.WATCHMEN_PG_USER,
    host: process.env.WATCHMEN_PG_HOST,
    database: process.env.WATCHMEN_PG_DATABASE,
    password: process.env.WATCHMEN_PG_PASSWORD,
    port: process.env.WATCHMEN_PG_PORT
  });

var eventHandlers = {
    
  /**
   * Service is back online
   * @param {Object} service
   * @param {Object} lastOutage
   * @param {Object} lastOutage.error
   * @param {number} lastOutage.timestamp (ms)
   */

    onServiceBack: function (service, lastOutage) {
      var duration = moment.duration(+new Date() - lastOutage.timestamp);
      console.log('Service is back up from outage, writing to database.');

      (async () => {
          // note: we don't try/catch this because if connecting throws an exception
          // we don't need to dispose of the client (it will be undefined)
          const client = await pool.connect()
        
          try {
            await client.query('BEGIN')
            const insertBackText = 'INSERT INTO service_back(name, duration, last_outage) VALUES($1, $2, $3)'
            const insertBackValues = [service.name, duration._milliseconds, moment(lastOutage.timestamp)]
            await client.query(insertBackText, insertBackValues)
            await client.query('COMMIT')
          } catch (e) {
            await client.query('ROLLBACK')
            throw e
          } finally {
            client.release()
          }
        })().catch(e => console.error(e.stack))
    },

  /**
   * Service is responding correctly
   * @param {Object} service
   * @param {Object} data
   * @param {number} data.elapsedTime (ms)
   */

    onServiceOk: function (service, data) {
      var serviceOkMsg = service.name + ' responded ' + 'OK!'.green;
      var responseTimeMsg = data.elapsedTime + ' ms.';
      var result_count=0;
      console.log(serviceOkMsg, responseTimeMsg.gray);

       //SELECT service_name from service_status where service_name=name
        //if null -> insert
        //else -> update last_ping
        pool.on('error', (err, client) => {
          console.error('Unexpected error on idle client', err)
          process.exit(-1)
        })
        
        pool.connect((err, client, done) => {
          if (err) throw err
          client.query('SELECT * FROM service_status WHERE name=$1', [service.name], (err, res) => {
            done()
            if (err) {
              console.log(err.stack)
            } else {
                result_count=res.rowCount;
                console.log(result_count);
                if (result_count>0){
                  console.log(result_count);
                  console.log('Service already exist, updating to Database');
                  (async () => {
                    const client = await pool.connect()
                    try {
                      await client.query('BEGIN')
                      const insertBackText = 'UPDATE service_status SET last_ping=$1 WHERE name=$2'
                      const insertBackValues = [moment(), service.name]
                      await client.query(insertBackText, insertBackValues)
                      await client.query('COMMIT')
                    } catch (e) {
                      await client.query('ROLLBACK')
                      throw e
                    } finally {
                      client.release()
                    }
                  })().catch(e => console.error(e.stack))  
                }
                else {
                  console.log(result_count);
                  console.log('Service not yet exist, writing to Database');
                  (async () => {
                    const client = await pool.connect()
                    try {
                      await client.query('BEGIN')
                      const insertBackText = 'INSERT INTO service_status(name, first_ping, last_ping) VALUES($1, $2, $3)'
                      const insertBackValues = [service.name, moment(),moment()]
                      await client.query(insertBackText, insertBackValues)
                      await client.query('COMMIT')
                    } catch (e) {
                      await client.query('ROLLBACK')
                      throw e
                    } finally {
                      client.release()
                    }
                  })().catch(e => console.error(e.stack))  
                }
            }
          })
        })
    }
};


function HistoryPlugin(watchmen) {
    watchmen.on('service-back', eventHandlers.onServiceBack);
    watchmen.on('service-ok', eventHandlers.onServiceOk);
}
exports = module.exports = HistoryPlugin;