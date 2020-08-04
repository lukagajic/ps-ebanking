const request = require('request');
const cheerio = require('cheerio');

const ExchangeRate = require('../models/ExchangeRate');
const Currency = require('../models/Currency');

module.exports = () => {
    const URL = 'https://www.kamatica.com/kursna-lista/nbs';

    request(URL, (err, response, html) => {
        const $ = cheerio.load(html);

        const redoviSaValutama = $('#wrapper > div:nth-child(3) > div > div > div.col-sm-8.nopadding > div.article > div > table > tbody > tr');
        const scrapedData = [];

        redoviSaValutama.each((index, element) => {
            const tds = $(element).find("td");
            const valuta = $(tds[2]).text();
            const kupovni = $(tds[4]).text();
            const srednji = $(tds[5]).text();
            const prodajni = $(tds[6]).text();
            const tableRow = { valuta, kupovni, srednji, prodajni };
            scrapedData.push(tableRow);
        });

        console.log(scrapedData[0]);
        
        let currencyId;

        Currency.findOne({
            where: { code: scrapedData[0].valuta }
        }).then(currency => {
            currencyId = currency.dataValues.currencyId;
            ExchangeRate.findAll({
                where: {
                    downloadedAt: new Date()
                }
            }).then(exchangeRate => {
                if(exchangeRate.length < 1) {
                    ExchangeRate.create({
                        sellingRate: scrapedData[0].prodajni,
                        buyingRate: scrapedData[0].kupovni,
                        middleRate: scrapedData[0].srednji,
                        currencyId: currencyId
                    }).then(newRecord => {
                        console.log('NEW RECORD: ' + newRecord)
                    }).catch(e => console.log('Greska pri unosu u bazu: ' + e)); 
                }
            }).catch(e => { console.log('Doslo je do greske: ' + e); })
        });
    });
}