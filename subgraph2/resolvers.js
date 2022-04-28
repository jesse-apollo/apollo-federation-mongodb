
module.exports = {
    Query: {
        getRollupByAirport: async (_, { limit }, { dataSources }, info) =>
            dataSources.ontimeAPI.getRollupByAirport(limit, info),
        getRollupByCarrier: async (_, { limit }, { dataSources }, info) =>
            dataSources.ontimeAPI.getRollupByCarrier(limit, info),
        getRollupByAircraft: async (_, { limit }, { dataSources }, info) =>
            dataSources.ontimeAPI.getRollupByAircraft(limit, info),
    },
    Airport: {
        average_delay: async (airport, _, { dataSources }, info) => 
            dataSources.ontimeAPI.getDelayByField(airport.code, 'ORIGIN'),
        recent_delays: async(airport, _, {dataSources}, info) =>
            dataSources.ontimeAPI.getDelayMetricsByField(airport.code, 'ORIGIN', info),
    },
    Registration: {
        average_delay: async (reg, _, {dataSources}, info) => 
            dataSources.ontimeAPI.getDelayByField(reg.n_number, 'TAIL_NUM'),
        recent_delays: async(airport, _, {dataSources}, info) =>
            dataSources.ontimeAPI.getDelayMetricsByField(reg.n_number, 'TAIL_NUM', info),
    }

};