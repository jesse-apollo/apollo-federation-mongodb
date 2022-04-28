const { DataSource } = require('apollo-datasource');


class OnTimeAPI extends DataSource {
    constructor(database) {
        super();
        this.database = database
        this.ontime = this.database.collection("OnTime");
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

    reMap(obj, type, ext) {
        var resultMap = {};
        var enumMap = {};
        if (type) {
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
        if (ext) {
            Object.assign(newObj, ext);
        }
        return newObj;
    }
  
    async getRollupByAirport(limit, info) {
        var pipeline = [
            {
                '$match': {
                    'DEP_DELAY': {
                        '$gt': 0
                    }
                }
            }, {
                '$group': {
                    '_id': '$ORIGIN',
                    'average_delay': { '$avg': '$DEP_DELAY' },
                    'min_delay': { '$min': "$DEP_DELAY" },
                    'max_delay': { '$max': "$DEP_DELAY" },
                    'std_dev': { '$stdDevPop': "$DEP_DELAY" },
                    'record_count': { '$count': {} }

                }
            }
        ];

        if (limit) {
            pipeline.push({ '$limit': limit });
        }

        const cursor = this.ontime.aggregate(pipeline);

        //console.log(await cursor.explain())

        var results = await cursor.toArray();
        
        results = results.map(x => this.reMap(x, null, {"airport":{"code":x._id}}));

        //console.log(results);

        return results.length > 0 ? results : [];
    }

    async getRollupByCarrier(limit, info) {
        var pipeline = [
            {
                '$match': {
                    'DEP_DELAY': {
                        '$gt': 0
                    }
                }
            }, {
                '$group': {
                    '_id': '$OP_CARRIER_AIRLINE_ID',
                    'average_delay': { '$avg': '$DEP_DELAY' },
                    'min_delay': { '$min': "$DEP_DELAY" },
                    'max_delay': { '$max': "$DEP_DELAY" },
                    'std_dev': { '$stdDevPop': "$DEP_DELAY" },
                    'record_count': { '$count': {} }

                }
            }
        ];

        if (limit) {
            pipeline.push({ '$limit': limit });
        }

        const cursor = this.ontime.aggregate(pipeline);

        //console.log(await cursor.explain())

        var results = await cursor.toArray();
        
        results = results.map(x => this.reMap(x, null, {"carrier":{"code":x._id}}));

        return results.length > 0 ? results : [];
    }

    async getRollupByAircraft(limit, info) {
        var pipeline = [
            {
                '$match': {
                    'DEP_DELAY': {
                        '$gt': 0
                    }
                }
            }, {
                '$group': {
                    '_id': '$TAIL_NUM',
                    'average_delay': {
                        '$avg': '$DEP_DELAY',
                        
                    },
                    'min_delay': { '$min': "$DEP_DELAY" },
                    'max_delay': { '$max': "$DEP_DELAY" },
                    'std_dev': { '$stdDevPop': "$DEP_DELAY" },
                    'record_count': { '$count': {} }

                }
            }
        ];

        if (limit) {
            pipeline.push({ '$limit': limit });
        }

        const cursor = this.ontime.aggregate(pipeline);

        //console.log(await cursor.explain())

        var results = await cursor.toArray();
        
        results = results.map(x => this.reMap(x, null, {"aircraft":{"n_number":x._id}}));
        console.log(results);

        return results.length > 0 ? results : [];
    }

    async getDelaysByCarrier(carrier) {
        const pipeline = [
            {
                '$match': {
                    'DEP_DELAY': {
                        '$gt': 0
                    }
                }
            }, {
                '$group': {
                    '_id': '$OP_CARRIER_AIRLINE_ID',
                    'average_delay': {
                        '$avg': '$DEP_DELAY'
                    }
                }
            }
        ];

        const cursor = this.ontime.aggregate(pipeline);

        //console.log(await cursor.explain())

        var results = await cursor.toArray();
        results = results.map(x => x._id);

        return results ? results : false;
    }


    async getDelayByField(code, field) {
        //console.log(code);

        if (field == "TAIL_NUM") {
            if (!code.startsWith("N")) {
                code = "N" + code;
            }
        }

        const pipeline = [
            {
                '$match': {
                    [field]: code
                }
            }, {
                '$group': {
                    '_id': '$' + field,
                    'average_delay': {
                        '$avg': '$DEP_DELAY'
                    }
                }
            }
        ];
        //console.log(pipeline);

        const cursor = this.ontime.aggregate(pipeline);

        //console.log(await cursor.explain())

        var results = await cursor.toArray();

        if (results.length > 0) {
            return results[0].average_delay;
        }

        return null;
    }

    async getDelayMetricsByField(code, field, info) {
        //console.log(code);

        const query = { [field]:code };

        console.log(query);
        
        const options = {
          limit: 10,
          sort: {'FL_DATE': -1 }
        };

        const cursor = this.ontime.find(query, options);

        var results = await cursor.toArray();
        results = results.map(x => this.reMap(x, 
            info.schema.getType('DelayMetric'),
            {
                "tail_number": {"n_number": x.TAIL_NUM }, 
                "carrier": {"code":x.OP_CARRIER_AIRLINE_ID },
                "origin": {"code": x.ORIGIN },
                "destination": {"code": x.DEST }
            }
        ));

        return results ? results : [];
    }
  
}
  
module.exports = OnTimeAPI;