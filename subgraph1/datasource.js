const { DataSource } = require('apollo-datasource');


class AirportAPI extends DataSource {
    constructor(database) {
        super();
        this.database = database
        this.airports = this.database.collection("Airports");
    }
  
    /**
     * This is a function that gets called by ApolloServer when being setup.
     * This function gets called with the datasource config including things
     * like caches and context. We'll assign this.context to the request context
     * here, so we can know about the user making requests
     */
    initialize(config) {
      this.context = config.context;
    }

    reMap(obj) {
        const newObj = {};
        for (const property in obj) {
            //console.log(`${property}: ${object[property]}`);
            if (property == "_id") {
                newObj["id"] = obj[property]
            } else {
                newObj[property.toLowerCase()] = obj[property];
            }
        }
        return newObj;
    }
  
  
    async getAirport(code, info) {

        const query = { Code: code };
        const airport = await this.airports.findOne(query);
        return airport ? this.reMap(airport) : false;
    }
  
  
    async getAirports(filter, sorting, info) {
        const query = {  };
        const options = {
          // sort matched documents in descending order by rating
          //sort: { "imdb.rating": -1 },
          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
          limit: 50
        };

        if (sorting != null) {
            options.sort = { sorting: 1 }
        }

        if (filter != null) {

        }

        const cursor = this.airports.find(query, options);

        var airports = await cursor.toArray();
        airports = airports.map(x => this.reMap(x));

        return airports ? airports : false;
    }
  

}
  
module.exports = AirportAPI;