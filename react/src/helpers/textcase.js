const textcase = (type, string) => {

    const casing = type.toLowerCase();
    switch (casing) {
        case "upper":
            return string.toUpperCase();
        case "sentence":
            return string.split(/[.!?]/).filter(sentence => sentence.trim() !== '').map(word => word.trim().charAt(0).toUpperCase().concat(word.slice(1).toLowerCase())).join('. ');
        case "lower":
            return string.toLowerCase();
        default:
            return type || string;
    }
};

export default textcase;