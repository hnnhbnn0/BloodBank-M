const objects = {
    filterSpecific: (object, type) =>
        Object.entries(object)
            .map(([key, value]) => ({ [key]: value[type] }))
            .reduce((acc, data) => ({ ...acc, ...data }), {}),
};

export default objects;