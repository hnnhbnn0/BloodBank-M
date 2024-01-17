function replacewords(body, replacements) {
    let replacedBody = body;
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp('\\$' + key, 'g');
        replacedBody = replacedBody.replace(regex, value);
    }
    return replacedBody;
}

export default replacewords;