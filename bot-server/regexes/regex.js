exports.getTokens = (text, regex) => {
    var keyword;
    var orderBy;
    // text = text.split(' ').join('');
    var match = regex.test(text);


    console.log('Match : ' + match);
    if (match) {
        var matches = text.match(regex);

        orderBy = matches[2];
        keyword = (matches[3].trim() == "") ? matches[1] : matches[3];

        return {
            "keyword": keyword,
            "orderBy": orderBy
        }
    }
    return null;
}