const { DataSource } = require('apollo-datasource');
const { isListType } = require('graphql');
const { ObjectId } = require('mongodb'); 


class EngineAPI extends DataSource {
    constructor(database) {
        super();
        this.database = database
        this.engines = this.database.collection("Engines");

        this.dicts = {
            "TYPE-ACFT": {
                "1": "Glider",
                "2": "Balloon",
                "3": "Blimp/Dirigible",
                "4": "Fixed wing single engine",
                "5": "Fixed wing multi engine",
                "6": "Rotorcraft",
                "7": "Weight-shift-control",
                "8": "Powered Parachute",
                "9": "Gyroplane",
                "H": "Hybrid Lift",
                "O": "Other"
            },
            "TYPE": {
                0: "None",
                1: "Reciprocating",
                2: "Turbo-prop",
                3: "Turbo-shaft",
                4: "Turbo-jet",
                5: "Turbo-fan",
                6: "Ramjet",
                7: "2 Cycle",
                8: "4 Cycle",
                9: "Unknown",
                10: "Electric",
                11: "Rotary",
            },
        }
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

    reMap(obj, type) {
        var resultMap = {};
        var enumMap = {};
        const fields = type.getFields();

        for (const field in fields) {
            if (fields[field].astNode.directives.length > 0) {
                const dirs = fields[field].astNode.directives;
                for (const dir in dirs) {
                    if (dirs[dir].name.value == "mongo") {
                        //resultMap[field] = dirs[dir].arguments[0].value.value;
                        resultMap[dirs[dir].arguments[0].value.value] = field;
                    } else if (dirs[dir].name.value == "lookup") {
                        enumMap[dirs[dir].arguments[0].value.value] = field;
                    }
                }
            }
        }
       
        const newObj = {};
        for (const property in obj) {
            if (property == "_id") {
                // replace mongo _id with "id" always
                newObj["id"] = obj[property]
            } else {
                if (property in resultMap) {
                    // remap field names from mongo field names
                    newObj[resultMap[property]] = obj[property];
                } else {
                    if (property in enumMap) {
                         // map in dictionaries (based on FAA data) into field results
                        newObj[enumMap[property]] = this.dicts[property][obj[property]];
                    } else {
                        // lowercase field names that map from mongo
                        newObj[property.toLowerCase()] = obj[property];
                    }
                }
            }
        }
        return newObj;
    }

    async getEngineByID(id, info) {

        const query = { _id: new ObjectId(id) };
        const result = await this.engines.findOne(query);

        if (result == null) {
            return false;
        }

        return this.reMap(result, info.schema.getType('Engine'));
    }
  
    async getEngineByCode(code, info) {

        const query = { CODE: code };
        const result = await this.engines.findOne(query);

        if (result == null) {
            return false;
        }

        return this.reMap(result, info.schema.getType('Engine'));
    }

    
    async getEngineMakerList(info) {
        const pipeline = [
            { $group: { _id: "$MFR", count: { $count: {}  } } }
            //{ $group: { _id: "$MFR", first: { $first: {}  } } }
        ];

        const cursor = this.engines.aggregate(pipeline);

        //console.log(await cursor.explain())

        var results = await cursor.toArray();
        results = results.map(x => x._id);

        return results ? results : false;
    }
  
    async getEngines(manufacturer, info) {

        const query = {  };
        if (manufacturer) {
            query["MFR"] = manufacturer.toUpperCase();
        }
        const options = {
          // sort matched documents in descending order by rating
          //sort: { "field": -1 },
          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
          limit: 50
        };

        /*if (sorting != null) {
            options.sort = { sorting: 1 }
        }

        if (filter != null) {

        }*/

        const cursor = this.engines.find(query, options);
        //console.log(await cursor.explain());

        var results = await cursor.toArray();
        results = results.map(x => this.reMap(x, info.returnType.ofType));

        return results ? results : false;
    }
}
  
module.exports = EngineAPI;