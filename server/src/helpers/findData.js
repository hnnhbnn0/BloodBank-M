
const findData = async (id, Model) => {
    const data = await Model.findById(id);
    return data;
}

export default findData;