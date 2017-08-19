exports.getTokens = (text, regex) => {
    var keyword;
    var searchBy;
    // text = text.split(' ').join('');
    var match = regex.test(text);

    console.log('Match : ' + match);
    if(match) {
        var matches = text.match(regex);
        
        searchBy = matches[2];
        keyword = (matches[3].trim() == "") ? matches[1] : matches[3];

        console.log('command : ' + text);
        console.log('keyword is', keyword);
        console.log('search by', searchBy);
        console.log('=====================');
    }
}