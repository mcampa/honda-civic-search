const request = require('request');

const zip = '94578';
const radius = 500;
const sort = 'LOCATION_NEAREST'; // BEST | PRICE_ASC | MILEAGE_ASC | LOCATION_NEAREST

// https://www.civicx.com/threads/2016-civic-vin-translator-decoder-guide.889/
const validDigits = ['F4', 'F6', 'F8', 'F9']; // any civic with CVT and Sensing
const url = `https://www.carfax.com/api/vehicles?make=Honda&model=Civic&zip=${zip}&radius=${radius}&sort=${sort}&yearMin=2016&yearMax=2018`;
listings = [];

function search(page = 1) {
    request.get({ url: `${url}&page=${page}`, json: true }, (e, r, payload) => {
        payload.listings.forEach(car => {
            const hasHondaSensing = validDigits.indexOf(car.vin.substr(6, 2)) > -1;
            const isSedan = car.trim !== 'Si';
            const duplicated = !!listings.find(c => c.vin === car.vin);

            if (hasHondaSensing && isSedan && !duplicated) {
                listings.push(car);
            }
        });

        console.log(`page ${payload.page} of ${payload.totalPageCount}. Listings found: ${listings.length}`);

        if (page < payload.totalPageCount) {
            search(page + 1);
        } else {
            print();
        }
    });
}

function print() {
    console.log('\n');
    listings.sort((a, b) => a.distanceToDealer - b.distanceToDealer);
    listings.forEach(car => {
        console.log(
            `${car.year} ${car.trim} ${car.exteriorColor}/${car.interiorColor}`,
            parseInt(car.distanceToDealer, 10),
            car.vin,
            `Price: $${car.currentPrice}`,
            `Milage: ${car.mileage}`,
            car.vdpUrl,
            car.dealer.dealerInventoryUrl
        )
    });
}


console.log(`searching`);
search();
