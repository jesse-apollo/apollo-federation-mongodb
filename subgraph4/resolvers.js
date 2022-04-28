
module.exports = {
    Query: {
        getAircraft: async (_parent, {manufacturer}, { dataSources }, info) =>
            dataSources.aircraftAPI.getAircraft(manufacturer, info),
        getAircraftByCode: async (_parent, {code}, { dataSources }, info) =>
            dataSources.aircraftAPI.getAircraftByCode(code, info),
        getAircraftByID: async (_parent, {id}, { dataSources }, info) =>
            dataSources.aircraftAPI.getAircraftByID(id, info),

        getEngines: async (_parent, {manufacturer}, { dataSources }, info) =>
            dataSources.engineAPI.getEngines(manufacturer, info),
        getEngineByCode: async (_parent, {code}, { dataSources }, info) =>
            dataSources.engineAPI.getEngineByCode(code, info),
        getEngineByID: async (_parent, {id}, { dataSources }, info) =>
            dataSources.engineAPI.getEngineByID(id, info),
        getEngineMakerList: async (_parent, _, { dataSources }, info) =>
            dataSources.engineAPI.getEngineMakerList(info),
        
        getRegistrationByID: async (_parent, {id}, { dataSources }, info) =>
            dataSources.regAPI.getRegistrationByID(id, info),
        getRegistrationByName: async (_parent, {registrant}, { dataSources }, info) =>
            dataSources.regAPI.getRegistrationByName(registrant, info),
        getRegistrationByN: async (_parent, {number}, { dataSources }, info) =>
            dataSources.regAPI.getRegistrationByN(number, info),
    },
    Aircraft: {
        __resolveReference: async (aircraft, { dataSources }, info) => { 
            if (aircraft.id) {
                return dataSources.aircraftAPI.getAircraftByID(aircraft.id, info);
            }
            if (aircraft.code) {
                return dataSources.aircraftAPI.getAircraftByCode(aircraft.code, info);
            }
            
            return null; 
        },
    },
    Registration: {
        __resolveReference: async (reg, { dataSources }, info) => { 
            console.log("Resolve ref ");
            console.log(reg);
            if (reg.id) {
                return dataSources.regAPI.getRegistrationByID(reg.id, info);
            }
            if (reg.n_number) {
                return dataSources.regAPI.getRegistrationByN(reg.n_number, info);
            }
            
            return null; 
        },
        aircraft: async (reg, _, { dataSources }, info) => { 
            return dataSources.aircraftAPI.getAircraftByCode(reg.aircraft_code, info);
        },
        engine: async (reg, _, { dataSources }, info) => { 
            return dataSources.engineAPI.getEngineByCode(reg.engine_code, info);
        }
    }


};