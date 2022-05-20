const { DataSource } = require('apollo-datasource');
const { isListType } = require('graphql');
const { ObjectId } = require('mongodb'); 


class RegistrationAPI extends DataSource {
    constructor(database) {
        super();
        this.database = database
        this.reg = this.database.collection("Registration");

        this.dicts = {
            "TYPE REGISTRANT": {
                1: "Individual",
                2: "Partnership",
                3: "Corporation",
                4: "Co-Owned",
                5: "Government",
                7: "LLC",
                8: "Non Citizen Corporation",
                9: "Non Citizen Co-Owned",
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

    async getRegistrationByID(id, info) {

        const query = { _id: new ObjectId(id) };
        const result = await this.reg.findOne(query);

        if (result == null) {
            return false;
        }

        return this.reMap(result, info.schema.getType('Registration'));
    }
  
    async getRegistrationByN(number, info) {

        if (number.startsWith("N")) {
            number = number.slice(1);
        }

        const query = { "N-NUMBER": number };
        const result = await this.reg.findOne(query);

        if (result == null) {
            return null;
        }

        return this.reMap(result, info.schema.getType('Registration'));
    }

    async getRegistrationByName(name, info) {

        const query = { NAME: name.toUpperCase() };
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
  
          const cursor = this.reg.find(query, options);
  
          var results = await cursor.toArray();
          results = results.map(x => this.reMap(x, info.returnType.ofType));
  
          return results ? results : false;
    }
  
    
}
  
module.exports = RegistrationAPI;