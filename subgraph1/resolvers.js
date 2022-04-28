
module.exports = {
    Query: {
        getAirports: async (_, { filter, sort }, { dataSources }, info) =>
            dataSources.airportAPI.getAirports(filter, sort, info),
        getAirport: async (_, { code }, { dataSources }, info) =>
            dataSources.airportAPI.getAirport(code, info),
    },
    Airport: {
        __resolveReference: async (airport, { dataSources }, info) => { 
            if (airport.code) {
                return dataSources.airportAPI.getAirport(airport.code, info); 
            }
        },
    },

};