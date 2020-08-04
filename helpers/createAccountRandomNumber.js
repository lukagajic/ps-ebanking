module.exports = () => {
    let accountNumber = '';
    for(let i = 0; i < 13; i++) {
        accountNumber += Math.floor(Math.random() * 10);
    }

    accountNumber += '-';
    
    for(let i=0; i < 2; i++) {
        accountNumber += Math.floor(Math.random() * 10);
    }

    return accountNumber;
}