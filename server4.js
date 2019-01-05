let express = require('express');
let cors = require('cors');
//let fs = require('fs');
//let request = require('request');
//let cheerio = require('cheerio');
let app     = express();
let Xray = require('x-ray');
//let csvToJson = require('convert-csv-to-json');
var x = Xray().delay(1000);
var y = Xray().delay(1000);
const isOnline = require('is-online');
const uuidv4 = require('uuid/v4');
const ebayOld = require('ebay-api');
const fs = require('fs');

//let pdfMakePrinter = require('./src/printer');
//var hummus = require('hummus');
//var pdfWriter = hummus.createWriter(new hummus.PDFStreamForResponse(res));


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const AWS_ACCESS_KEY_ID = 'AKIAJDO4OK6L3UJO2W7Q';
const AWS_SECRET_ACCESS_KEY = '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';
const SELLER_ID = 'AMXNXR0LS8KWP';
const MWS_AUTH_TOKEN = 'amzn.mws.f2a68887-baf4-1e0d-e265-2493f2913bb6';
const MARKETPLACE_ID_1 = 'ATVPDKIKX0DER';
var amazonMws = require('amazon-mws')(AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY); 
var compression = require('compression');
const download = require('download');
app.use(cors());
app.use(compression());
//app.use(express.static('pictures'));
//app.use(express.static(__dirname + '/pictures'));
app.use('/images', express.static(__dirname + '/pictures'));
app.use('/amazonPDF', express.static(__dirname + '/amazonPDF'));
//const REFRESH_TOKEN = 'v^1.1#i^1#I^3#p^3#f^0#r^1#t^Ul4xMF8zOkYxRjNBRUI2NURDMzA3NUU5OEJCQkM5MDA2RTRFQTcxXzJfMSNFXjI2MA==';
const axios = require("axios");
let Ebay = require('ebay-node-api');

/*let ebay_refresh = new Ebay({
    clientID: 'OrrShlom-surplus3-PRD-9246ab013-0bb7ceb6',
    clientSecret: 'PRD-246ab013c215-6e44-4a97-a4db-107e',
    body: {
        'grant_type': 'refresh_token',
        'refresh_token': REFRESH_TOKEN,
        'scope':'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
        }
})*/

//**************************************** 

const ebayMarketplaceSchema = new mongoose.Schema({
    id: String,
    ebayUserId: String,
    clientID: String,
    clientSecret: String,
    devId: String,
    authToken: String,
    refreshToken: String,
})

const amazonMarketplaceSchema = new mongoose.Schema({
    id: String,
    awsAccessKeyID: String,
    awsSecretAccessKey: String,
    sellerID: String,
    mwsAuthToken: String,
    marketplaceID: String,
})


const BrandSchema = new mongoose.Schema({
    id: String,
    value: String,
})

const LocationSchema = new mongoose.Schema({
    id: String,
    value: String,
})


const ListingSchema = new mongoose.Schema({
    uuid: String,
    itemId: String,
    timestamp: Date,
    lastModified: Date,
    authorId: String,
    sku: String,
    title: String,
    description: String,
    category: Object,
    brand: String,
    partNumbers: Array,
    upc: String,
    pictures: Array,
    location: Array,
    quantity: Number,
    condition: String,
    conditionDescription: Array,
    price: String,
    bestOffer: Boolean,
    freeShipping: Boolean,
    domestic: String,
    international: String,
    length: String,
    width: String,
    depth: String,
    weight: String,
    weightUnit: String,
    compatibilityManual: Array,
    compatibilityEbayId: String,
    hasCompatibility: Boolean,
    status: String,
    ebayAccount: String,
    amazonAccount: String,
    asin: String,
})

const AmazonLabelSchema = new mongoose.Schema({
    uuid: String,
    timestamp: Date,
    orderId: String,
    sku: String,
    title: String,
    qtyOrdered: Number,
    brand: String,
    partNumber: String,
    location: String,
    price: String,
    firstPicture: String,
    lastPicture: String,
    remaining: Number,
    dateChecked: Date,
    checked: Boolean,
  })

const Listing = mongoose.model('Listing', ListingSchema);
const Location = mongoose.model('Location', LocationSchema);
const Brand = mongoose.model('Brand', BrandSchema);

const ebayMarketplace = mongoose.model('ebayMarketplace', ebayMarketplaceSchema);
const amazonMarketplace = mongoose.model('amazonMarketplace', amazonMarketplaceSchema);

const amazonLabel = mongoose.model('amazonLabel', AmazonLabelSchema);

//************************************************






const AmazonOrderSchema = new mongoose.Schema({
    orderItemId: String,
    sellerSKU: String,
    quantityOrdered: Number,
    checked: Boolean,
});

const EbayOrderSchema = new mongoose.Schema({
    orderItemId: String,
    creationDate: Date,
    sellerSKU: String,
    ebayId: String,
    quantityOrdered: Number,
    checked: Boolean,
})


const AmazonRequestSchema = new mongoose.Schema({
    id: String,
    amazonMarketplaceId: String,
    asin: String,
    sku: String,
    template: String,
    templatePrice: String,
    templateQuantity: String,
    timestamp: Date,
    status: Boolean,
    statusPrice: Boolean,
    statusQuantity: Boolean,
})

const AmazonOrder = mongoose.model('AmazonOrder', AmazonOrderSchema);
const EbayOrder = mongoose.model('EbayOrder', EbayOrderSchema);

const AmazonRequest = mongoose.model('AmazonRequest', AmazonRequestSchema);

//module.exports = mongoose.model('Order', orderSchema);


let respuesta = [];

var jsonQ=require("jsonq"); 


const jsonfile = require('jsonfile');



const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');
 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'ebayObjects';
 


let salida;

app.get('/scrape/:url', function(req, res){

  //https%3A%2F%2Fwww.factorymoparparts.com%2Foem-parts%2Fmopar-center-pillar-trim-5ge60wl5al

  let tempUrl =  req.params.url; 
  console.log(tempUrl);
  //let tempUrl = "https://www.factorymoparparts.com/oem-parts/mopar-center-pillar-trim-5ge60wl5al";


  //x('https://www.factorymoparparts.com/oem-parts/mopar-center-pillar-trim-5ge60wl5al', 
  //let url = 'https://www.factorymoparparts.com/oem-parts/mopar-center-pillar-trim-5ge60wl5al'
    y(tempUrl,
    '.fitment-row', [{
        make: '.fitment-make',
        model: '.fitment-model',
        year: '.fitment-year',
        trim: '.fitment-trim',
        engine: '.fitment-engine',
    }])
    .paginate('.nav-previous a@href')
    .limit(1)
    .then(function (result) {
        
        if (result < 1){
            
            y(tempUrl,
            '.item', [{
                make: '.make span',
                model: '.model span',
                year: '.year span',
                engine: '.engine span',
            }])
            .paginate('.nav-previous a@href')
            .limit(1)
            .then(function (result) {
                
                let resultTemp = [];
            
                for (let i in result){
                    let year = result[i].year;
                    let make = result[i].make;
                    let model = result[i].model;
                    let engine = result[i].engine;

                    if (!year.includes('-')){
                        resultTemp.push({make, model, year, engine});
                    } else {
                        let initYear = year.split('-')[0];
                        let endYear = year.split('-')[1];
                        let years = Number(endYear) - Number(initYear);
                        for (let n = 0; n <= years; n ++){
                            let tempYear = Number(initYear) + n;
                            resultTemp.push({make, model, year: String(tempYear), engine});
                        }; 
                    };
                }
                res.send(resultTemp);
            })
        } else if (result[0].make == null) {
            y(tempUrl,
                '.fitment-row:not(.fitment-hidden)', [{
                    year_make_model: '.fitment-year-make-model',
                    trim: '.fitment-trim',
                    engine: '.fitment-engine',
                }])
                .paginate('.nav-previous a@href')
                .limit(1)
                .then(function (result) {
                    
                    let resultTemp = [];
                
                    for (let i in result){
                        let year = result[i].year_make_model.split(' ')[0];
                        let make = result[i].year_make_model.split(' ')[1];
                        let model = result[i].year_make_model.split(' ')[2];
                        let trim = result[i].trim;
                        let engine = result[i].engine;
                        
                        resultTemp.push({make, model, year, trim, engine});
                    }
                    res.send(resultTemp);
                })
            } else {
            res.send(result);
        }
    });
});


app.get('/finder/:brand/:partNumber', function(req, res){
    let partNumber = req.params.partNumber;
    let brand = req.params.brand;
    let tempUrl =  "https://www.google.com/search?q="+ brand + "+" + partNumber; 
    console.log(tempUrl);
    
    x(tempUrl,
        '.r', [{
            url: 'a@href'
        }])
        .limit(1)
        .then(function (result) {
            const goodFitment = result.filter((item) => {
                  if (item.url.includes('moparamerica.com')||
                      item.url.includes('tascaparts.com')||
                      item.url.includes('factorymoparparts.com')||
                      item.url.includes('originalmoparparts.com')||
                      item.url.includes('worldoemparts.com')||
                      item.url.includes('quirkparts.com')||
                      item.url.includes('moparwholesaleparts.com')||
                      item.url.includes('parts.jeepsareus.com')||
                      item.url.includes('mymoparparts.com')||
                      item.url.includes('moparpartscanada.ca')||
                      item.url.includes('moparpart.com')||
                      item.url.includes('fordpartsgiant.com')||
                      item.url.includes('gmpartsdirect.com')||
                      item.url.includes('oemford.parts')||
                      item.url.includes('bluespringsfordparts.com')||
                      item.url.includes('infinitipartsonline.com')||
                      item.url.includes('xportautoparts.com')||
                      item.url.includes('lhmchevypartshq.com')||
                      item.url.includes('bestmopar.com')||
                      item.url.includes('hyundaipartsdeal.com')||
                      item.url.includes('gmpartsguru.com.com')||
                      item.url.includes('gmpartsoutlet.com')||
                      item.url.includes('fordgenuineautoparts.com')||
                      item.url.includes('gmpartsonline.com')||
                      item.url.includes('gmpartsgiant.com')||
                      item.url.includes('partsplus.com')||
                      item.url.includes('jeepsareus.com')||
                      item.url.includes('moparwholesaleparts.com')||
                      item.url.includes('cheapmopar.com')||
                      item.url.includes('jeepdodgeoemparts.com')||                     
                      item.url.includes('worldoemparts.com')||                     
                      item.url.includes('factorymopardirect.com')||                     
                      item.url.includes('parts.moparonlineparts.com')||                     
                      item.url.includes('parts.rontonkindodge.net')||                     
                      item.url.includes('moparbayarea.com')||                     
                      item.url.includes('moparfactoryparts.com')||
                      item.url.includes('oemflorida.com')||
                      item.url.includes('moparpartsgiant.com')||                                           
                      item.url.includes('dodgepartshop.com')                      
                      )
                      return item.url;
            });

            console.log("Este es: " + goodFitment[0].url);
            let fitmentUrl = "https://www.google.com" + goodFitment[0].url;
            console.log(fitmentUrl);
            
            y(fitmentUrl,
                '.fitment-row', [{
                    make: '.fitment-make',
                    model: '.fitment-model',
                    year: '.fitment-year',
                    trim: '.fitment-trim',
                    engine: '.fitment-engine',
                }])
                .paginate('.nav-previous a@href')
                .limit(1)
                .then(function (result) {
                    
                    if (result < 1){
                        
                        y(fitmentUrl,
                        '.item', [{
                            make: '.make span',
                            model: '.model span',
                            year: '.year span',
                            engine: '.engine span',
                        }])
                        .paginate('.nav-previous a@href')
                        .limit(1)
                        .then(function (result) {
                            
                            let resultTemp = [];
                        
                            for (let i in result){
                                let year = result[i].year;
                                let make = result[i].make;
                                let model = result[i].model;
                                let engine = result[i].engine;
            
                                if (!year.includes('-')){
                                    resultTemp.push({make, model, year, engine});
                                } else {
                                    let initYear = year.split('-')[0];
                                    let endYear = year.split('-')[1];
                                    let years = Number(endYear) - Number(initYear);
                                    for (let n = 0; n <= years; n ++){
                                        let tempYear = Number(initYear) + n;
                                        resultTemp.push({make, model, year: String(tempYear), engine});
                                    }; 
                                };
                            }
                            if (resultTemp.length > 0){ 
                                resultTemp.splice(0,0,{'Url': fitmentUrl});
                            }
                            res.send(resultTemp); 
                        })
                        .catch(function(error){
                            //console.log(error);
                            console.log("Can't find Fitment! for " + brand + " " + partNumber);
                            res.send([]);
                        })

                    } else if (result[0].make == null) {
                        y(fitmentUrl,
                            '.fitment-row:not(.fitment-hidden)', [{
                                year_make_model: '.fitment-year-make-model',
                                trim: '.fitment-trim',
                                engine: '.fitment-engine',
                            }])
                            .paginate('.nav-previous a@href')
                            .limit(1)
                            .then(function (result) {
                                
                                let resultTemp = [];
                            
                                for (let i in result){
                                    let year = result[i].year_make_model.split(' ')[0];
                                    let make = result[i].year_make_model.split(' ')[1];
                                    let model = result[i].year_make_model.split(' ')[2];
                                    let trim = result[i].trim;
                                    let engine = result[i].engine;
                                    
                                    resultTemp.push({make, model, year, trim, engine});
                                }
                                if (resultTemp.length > 0) { resultTemp.splice(0,0,{'Url': fitmentUrl}) };  
                                res.send(resultTemp);
                            })
                            .catch(function(error){
                                //console.log(error);
                                console.log("Can't find Fitment! for " + brand + " " + partNumber);
                                res.send([]);
                            })

                    } else {
                        if (result.length > 0) { result.splice(0,0,{'Url': fitmentUrl}) };  
                        res.send(result);
                    }
                });
        })
        .catch(function(error){
            //console.log(error);
            console.log("Can't find Fitment! for " + brand + " " + partNumber);
            res.send([]);
        })         
});

app.get('/websitefinder/:brand/:partNumber', function(req, res){

    //https%3A%2F%2Fwww.factorymoparparts.com%2Foem-parts%2Fmopar-center-pillar-trim-5ge60wl5al
    
    let partNumber = req.params.partNumber;
    let brand = req.params.brand;

    //let tempUrl = "https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3D" + brand + "%2B" + partNumber;
    //let tempUrl = "https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3DMopar%2B55360642AB";
    //let tempUrl = "https://www.google.com/search?q=Mopar+55360642AB"

    let tempUrl =  "https://www.google.com/search?q="+ brand + "+" + partNumber; 
    console.log(tempUrl);
    //let tempUrl = "https://www.factorymoparparts.com/oem-parts/mopar-center-pillar-trim-5ge60wl5al";
  
  
    //x('https://www.factorymoparparts.com/oem-parts/mopar-center-pillar-trim-5ge60wl5al', 
    //let url = 'https://www.factorymoparparts.com/oem-parts/mopar-center-pillar-trim-5ge60wl5al'
    
    x(tempUrl,
      '.r', [{
          url: 'a@href'
      }])
      .limit(1)
      .then(function (result) {
          const goodFitment = result.filter((item) => {
                if (item.url.includes('moparamerica.com')||
                    item.url.includes('tascaparts.com')||
                    item.url.includes('factorymoparparts.com')||
                    item.url.includes('originalmoparparts.com')||
                    item.url.includes('worldoemparts.com')||
                    item.url.includes('quirkparts.com')||
                    item.url.includes('moparwholesaleparts.com')||
                    item.url.includes('parts.jeepsareus.com')||
                    item.url.includes('mymoparparts.com')||                    
                    item.url.includes('moparpartscanada.ca')
                    )
                    return item.url;
            });
            
            console.log("Este es: " + goodFitment[0].url);
            //if (goodFitment.length < 1) { throw res.send("No Fitments"); };
            let fitmentUrl = "https://www.google.com" + goodFitment[0].url; 
            //res.send(fitmentUrl);

            console.log(fitmentUrl);
            y(fitmentUrl,
            '.fitment-row', [{
                make: '.fitment-make',
                model: '.fitment-model',
                year: '.fitment-year',
                trim: '.fitment-trim',
                engine: '.fitment-engine',
            }])            
            .then(function (result) {
                //console.log(result);
                //result.push(fitmentUrl);
                if (result.length > 0) { result.splice(0,0,{'Url': fitmentUrl}) };  
                res.send(result);
            });
        
            //console.log(result);  
        
            //res.send(goodFitment[0]);
            
    
      })
      .catch(function(error){
        console.log(error);
        console.log("Can't find Fitment! for " + brand + " " + partNumber);
        res.send([]);
      })          
  });


app.get('/epidfinder/:partNumber', function(req, res){
  let partNumber = req.params.partNumber.toUpperCase();
  console.log(partNumber);
  
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
    if (err) throw err;
    console.log("Connected successfully to server");
   
    const db = client.db(dbName);
    const query = { "ManufacturePartNumber": partNumber };

    db.collection("epids").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
        console.log(result);
        client.close();
    });
  });
});






app.get('/getbrands', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    console.log("GET BRANDS");

    Brand.find({}, function(err, result){
        res.send(result);

    });
    /*MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
      if (err) throw err;
      console.log("Connected successfully to server");
     
      const db = client.db(dbName);
      const query = { "ManufacturePartNumber": partNumber };
  
      db.collection("epids").find(query).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
          console.log(result);
          client.close();
      });
    }); */
  });

app.get('/getlocations', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    console.log("GET LOCATIONS");

    Location.find({}, function(err, result){
        res.send(result);

    });
    /*MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
      if (err) throw err;
      console.log("Connected successfully to server");
     
      const db = client.db(dbName);
      const query = { "ManufacturePartNumber": partNumber };
  
      db.collection("epids").find(query).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
          console.log(result);
          client.close();
      });
    }); */
  });


  
  app.get('/getebaymarketplaces', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    let id = req.params.id;
    //let key = 'MAGIC3232!'
    console.log("GET EBAY MARKETPLACES");

    //if (id === key){

        ebayMarketplace.find({}, function(err, result){
            res.send(result);

        });

      //  } else {
      //      res.send([])
      //  }

    }
    
  );

  app.get('/getamazonmarketplaces', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    let id = req.params.id;
    //let key = 'MAGIC3232!'
    console.log("GET AMAZON MARKETPLACES");

    //if (id === key){

        amazonMarketplace.find({}, function(err, result){
            res.send(result);

        });

      //  } else {
      //      res.send([])
      //  }

    }
    
  );


  app.get('/addlocation/:locationid/:locationvalue', function(req, res){
      let id = req.params.locationid;
      let value = req.params.locationvalue;

      Location.find({id: id}, function(err ,resultLocation){

      if (resultLocation.length === 0) {  

            const newLocation = new Location({
                id: id,
                value: value,
            });

                newLocation.save().then(() => {                                
                    console.log('New Location created');
                    res.send(true)
                })
        }
    })
  })

  app.get('/addbrand/:brandid/:brandvalue', function(req, res){
    let id = req.params.brandid;
    let value = req.params.brandvalue;

    Brand.find({id: id}, function(err ,resultBrand){

    if (resultBrand.length === 0) {  

          const newBrand = new Brand({
              id: id,
              value: value,
              });

              newBrand.save().then(() => {                                
                  console.log('New Brand created');
                  res.send(true)
              })
      }
  })
})

function downloadPicture(url, dir, fileName){
    setTimeout(function(){ 
      //console.log("Waiting 5 seconds!"); 
  
      download(url).then(data => {
          
        
      
          fs.writeFile(dir + '/' + fileName + '.jpg', data, (err)=> {
            if (err) throw err;
            console.log('Picture saved');
          })
  
      });
  
    }, 3000);
  
  }

function getPicturesInformation(results, sku){
    console.log(results);
    const listing = results.Item;
    const itemId = listing.ItemID;
  
    const picturesTemp = listing.PictureDetails.PictureURL;
    console.log(picturesTemp);
  
    let otherPictures = [];
  
    if (typeof picturesTemp === 'object'){
      
          otherPictures = picturesTemp.map((item) => {
              return {ebayUrl: item.replace('$_1', '$_10'), id: uuidv4()}
    })
    } else {
          try {
              otherPictures = [{ebayUrl: picturesTemp.replace('$_1', '$_10'), id: uuidv4()}];
          } catch(error){
              otherPictures = [];
          }
    }
  
  
    const pictures = otherPictures;
  
    pictures.forEach( (item) => {
      let fileName = item.id;
      downloadPicture(item.ebayUrl, './pictures', fileName);
      }
    );
  
    Listing.updateOne({"sku": sku}, 
    {
        "pictures": pictures.map(item => item.id),
    }, function(err, raw){
      if (err) throw Error("Network Error!");
      console.log(raw);
    });
  
}





  app.get('/addrequestamazonlisting/:amazonid/:asin/:sku', function(req, res){
    let asin = req.params.asin;
    let sku = req.params.sku;
    let amazonid = req.params.amazonid;
    let id = uuidv4();
    console.log("CREATE AMAZON REQUEST");

    amazonMarketplace.find({id:amazonid}, function(err, resultMarketplace){

        Listing.find({sku:sku}, function(err, resultListing){

            if (resultListing.length > 0){
                Brand.find({id: resultListing[0].brand}, function(err, resultBrand){
                    let brand = resultBrand[0].value;
                    let partNumber = resultListing[0].partNumbers[0];
                    let title = resultListing[0].title;
                    let quantity = resultListing[0].quantity;
                    let price = resultListing[0].price;
                    let createDate = new Date;                   

                    

    
                    const feedTemp = 
                       `<Message>
                        <MessageID>${Math.floor(Math.random()*100000)}</MessageID>
                        <OperationType>PartialUpdate</OperationType>
                        <Product>
                        <SKU>${sku}</SKU>
                        <StandardProductID>
                        <Type>ASIN</Type>
                        <Value>${asin}</Value>
                        </StandardProductID>
                        <LaunchDate>${createDate.toISOString()}</LaunchDate>
                        <Condition>
                        <ConditionType>New</ConditionType>                                               
                        </Condition>
                        </Product> 
                        </Message>`

                        const feedTempPrice = 
                        `<Message>
                        <MessageID>${Math.floor(Math.random()*100000)}</MessageID>
                        <OperationType>Update</OperationType>
                        <Price>
                        <SKU>${sku}</SKU>
                        <StandardPrice currency="USD">${price}</StandardPrice>
                        </Price>
                        </Message>`

                         const feedTempQuantity = 
                        `<Message>
                         <MessageID>${Math.floor(Math.random()*100000)}</MessageID>
                         <OperationType>Update</OperationType>
                         <Inventory>
                         <SKU>${sku}</SKU>
                         <Quantity>${quantity}</Quantity>
                         <FulfillmentLatency>1</FulfillmentLatency> 
                         </Inventory>
                         </Message>`
                         
 

                        const newAmazonRequest = new AmazonRequest({
                        id: id,
                        amazonMarketplaceId: amazonid,
                        asin: asin,
                        sku: sku,
                        timestamp: createDate,
                        template: feedTemp.replace(/\s+/g,' ').trim(),
                        templatePrice: feedTempPrice.replace(/\s+/g,' ').trim(),
                        templateQuantity: feedTempQuantity.replace(/\s+/g,' ').trim(),
                        status: false,
                        statusPrice: false,
                        statusQuantity: false,
                        });

                        newAmazonRequest.save().then(() => {                                
                            console.log('New Amazon Request created');
                            changeListingAsinInDatabase(sku, 'pending');
                            res.send(true)
                        
                            
                        
                        
                        });

                    });
                }
            });

  });

});
 

  function messageTemplate(messageid, amazonid, asin, sku){

    // Operation type: Update | PartialUpdate 
    
    amazonMarketplace.find({id:amazonid}, function(err, resultMarketplace){

        Listing.find({sku:sku}, function(err, resultListing){

            if (resultListing.length > 0){
                Brand.find({id: resultListing[0].brand}, function(err, resultBrand){
                    let brand = resultBrand[0].value;
                    let partNumber = resultListing[0].partNumbers[0];
                    let title = resultListing[0].title;
                    let quantity = resultListing[0].quantity;
    
    
                    const feedTemp = 
                       `<Message>
                        <MessageID>${messageid}</MessageID>
                        <OperationType>PartialUpdate</OperationType>
                        <Product>
                        <SKU>${sku}</SKU>
                        <ConditionType>New</ConditionType>
                        <StandardProductID>
                        <Type>ASIN</Type>
                        <Value>${asin}</Value>
                        </StandardProductID>
                        <ProductTaxCode>A_GEN_NOTAX</ProductTaxCode>
                        <LaunchDate>2018-10-31T20:47:45.998Z</LaunchDate>
                        <DescriptionData>
                        <Title>${title}</Title>
                        <Description>${title}</Description>
                        <BulletPoint>${title}</BulletPoint>
                        <Manufacturer>${brand}</Manufacturer>
                        <MfrPartNumber>${partNumber}</MfrPartNumber>
                        <SearchTerms>${partNumber}</SearchTerms>
                        <ItemType>Auto Part</ItemType>
                        <IsGiftWrapAvailable>false</IsGiftWrapAvailable>
                        <IsGiftMessageAvailable>false</IsGiftMessageAvailable>
                        </DescriptionData>
                        <Inventory>
                        <SKU>${sku}</SKU>
                        <Quantity>${quantity}</Quantity>
                        <FulfillmentLatency>1</FulfillmentLatency>
                        </Inventory>
                        </Product>
                        </Message>`
    
                    //console.log(feedTemp.trim());
                    return feedTemp.trim();
                })
            }
        })
        })
    }



  app.get('/createamazonlisting/:amazonid/:asin/:sku', function(req, res){
    let asin = req.params.asin;
    let sku = req.params.sku;
    let amazonid = req.params.amazonid;
    console.log("CREATE AMAZON LISTING");

    amazonMarketplace.find({id:amazonid}, function(err, resultMarketplace){

        Listing.find({sku:sku}, function(err, resultListing){

            if (resultListing.length > 0){
                Brand.find({id: resultListing[0].brand}, function(err, resultBrand){
                    let brand = resultBrand[0].value;
                    let partNumber = resultListing[0].partNumbers[0];
                    let title = resultListing[0].title;

                    const feedContent = `
                        <?xml version="1.0" encoding="iso-8859-1"?>
                        <AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
                        <Header>
                        <DocumentVersion>1.01</DocumentVersion>
                        <MerchantIdentifier>AMXNXR0LS8KWP</MerchantIdentifier>
                        </Header>
                        <MessageType>Product</MessageType>
                        <PurgeAndReplace>false</PurgeAndReplace>
                        <Message>
                        <MessageID>1</MessageID>
                        <OperationType>PartialUpdate</OperationType>
                        <Product>
                        <SKU>${sku}</SKU>
                        <StandardProductID>
                        <Type>ASIN</Type>
                        <Value>${asin}</Value>
                        </StandardProductID>
                        <ProductTaxCode>A_GEN_NOTAX</ProductTaxCode>
                        <LaunchDate>2018-10-31T20:47:45.998Z</LaunchDate>
                        <DescriptionData>
                        <Title>${title}</Title>
                        <Description>${title}</Description>
                        <BulletPoint>${title}</BulletPoint>
                        <Manufacturer>${brand}</Manufacturer>
                        <MfrPartNumber>${partNumber}</MfrPartNumber>
                        <SearchTerms>${partNumber}</SearchTerms>
                        <ItemType>Auto Part</ItemType>
                        <IsGiftWrapAvailable>false</IsGiftWrapAvailable>
                        <IsGiftMessageAvailable>false</IsGiftMessageAvailable>
                        </DescriptionData>
                        </Product>
                        </Message>
                        </AmazonEnvelope>`

                        console.log(feedContent);

                        let feedRequest = function () {
    
                            //let FeedContent = fse.readFileSync('./file.txt', 'UTF-8');
                            //console.log('FeedContent ', FeedContent);
                        
                            amazonMws.feeds.submit({
                                'Version': '2009-01-01',
                                'Action': 'SubmitFeed',
                                'FeedType': '_POST_PRODUCT_DATA_',
                                'FeedContent': feedContent.trim(),
                                'SellerId': resultMarketplace[0].sellerID,
                                'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
                            }, function (error, response) {
                                if (error) {
                                    console.log('error ', error);
                                    return;
                                }
                                res.send(response);
                            
                            });
                        };
                        
                        feedRequest();


                        

                });
            } else {
                res.send(false);
            }
        
        
        
        });




        });
    });

  function getShippingServiceCode(value){
      if (value === '0'){
          return 'USPSFirstClass'
      } else if (value === '1'){
          return 'USPSPriority'
      } else if (value === '2'){
          return 'UPSGround'
      } else if (value === '3'){
          return 'Freight'
      } else if (value === '4'){
          return 'LocalDelivery'
      } else if (value === '5'){
          return 'FedExGround'
      }
  }

  function getShippingType(value){
      if (value === '3'){
          return 'Freight'
      } else if (value === '4'){
          return 'Free'
      } else {
          return 'Calculated'
      }
  }

  function getConditionID(value){
      if (value === '0'){
          return '1000'
      } else if (value === '1'){
          return '1500'
      } else if (value === '2'){
          return '3000'
      } else if (value === '3'){
          return '2000'
      }
  }

  app.get('/fixpictures/:sku', function(req, res){
    let sku = req.params.sku;
    console.log("FIX PICTURES IN" + sku);

    Listing.find({"sku": sku}, function(err, result){
        
        if (result.length > 0){

        let ebayAccount = result[0].ebayAccount;
            
            
        ebayMarketplace.find({"id": ebayAccount}, function(err, resultMarketplace){



          ebayOld.xmlRequest({
            serviceName : 'Trading',
            opType : 'GetItem',
          
            // app/environment
            devId: resultMarketplace[0].devId,
            certId: resultMarketplace[0].clientSecret,
            appId: resultMarketplace[0].clientID,
            sandbox: false,
                  
            // per user
            authToken: resultMarketplace[0].authToken,
          
            params: {
              'ItemID': result[0].itemId,
              'IncludeItemCompatibilityList': 'false',
              'IncludeItemSpecifics': 'true',
              'DetailLevel': 'ReturnAll',
            }
          }, function(error, results) {
            console.log(results)
            getPicturesInformation(results, sku);
          })
    
        

        })
        
        

    } 
    res.send(result);

      })

      

      

});


app.get('/createlisting/:sku/:fields', function(req, res){
    let sku = req.params.sku;
    let fields = req.params.fields;
    let objeto = JSON.parse(fields);
    console.log(fields);
    console.log("CREATE LISTING: " + sku);
    console.log(objeto);

    Listing.find({"sku": sku}, function(err, result){

        const newListing = new Listing({
            sku: objeto.sku,
            uuid: objeto.sku,
            quantity: objeto.quantity,
            price: objeto.price,
            title: objeto.title,
            brand: objeto.brand,
            partNumbers: objeto.partNumbers,
            upc: objeto.upc,
            bestOffer: objeto.bestOffer,
            description: objeto.description,
            condition: objeto.condition,
            conditionDescription: objeto.conditionDescription !== null && objeto.condition !== '0' ? objeto.conditionDescription : [],
            location: objeto.location,
            freeShipping: objeto.freeShipping,
            domestic: objeto.domestic,
            international: objeto.international,
            length: objeto.length,
            width: objeto.width,
            depth: objeto.depth,
            weight: objeto.weight,
            weightUnit: objeto.weightUnit,
            category: objeto.category,
            timestamp: new Date,
            ebayAccount: objeto.ebayAccount,
            status: "offline",
            authorId: objeto.authorId,
        })

        newListing.save().then(() => {                                
            console.log('New Listing created');
            res.send(true)
        })
    })
  })

  app.get('/getlisting/:sku', function(req, res){
    
    let sku = req.params.sku;

    console.log("GET LISTING " + sku);

    Listing.findOne({"sku":sku},function(err, result){
        
        res.json(result);
    });
    
  });



  app.get('/updatelisting/:sku/:fields', function(req, res){
    let sku = req.params.sku;
    let fields = req.params.fields;
    let objeto = JSON.parse(fields);
    console.log(fields);
    console.log("UPDATING LISTING: " + sku);
    console.log(objeto);



        let fieldsParameters = {
            "quantity": objeto.quantity,
            "price": objeto.price,
            "title": objeto.title,
            "brand": objeto.brand,
            "partNumbers": objeto.partNumbers,
            "bestOffer": objeto.bestOffer,
            "description": objeto.description,
            "condition": objeto.condition,
            "conditionDescription": objeto.conditionDescription !== null && objeto.condition !== '0' ? objeto.conditionDescription : [],
            "location": objeto.location,
            "locationValues": objeto.locationValues,
            "freeShipping": objeto.freeShipping,
            "domestic": objeto.domestic,
            "international": objeto.international,
            "length": objeto.length,
            "width": objeto.width,
            "depth": objeto.depth,
            "weight": objeto.weight,
            "weightUnit": objeto.weightUnit,
            "category": objeto.category,
            "lastModified": new Date,
        }
    
        Listing.find({"sku": sku}, function(err, result){
            
            let ebayAccount = result[0].ebayAccount;
            let stringLocations = '';
            
            ebayMarketplace.find({"id": ebayAccount}, function(err, resultMarketplace){


              Brand.find({'id': fieldsParameters.brand}, function(err, resultBrand){
                
                const reducer = (acc, curr) => acc + ' ' + curr;
         
                stringLocations = fieldsParameters.locationValues.length > 0 ? fieldsParameters.locationValues.reduce(reducer) : '';
                
                let brandValue = resultBrand[0].value;
                //console.log(stringLocations);
                //console.log(resultBrand[0].value);

                const reducer2 = (acc, curr, index) => {
                    if (index > 1){
                        return acc + ' ' + curr;
                    } else { 
                        return '';
                    }
                }

                let otherPartNumbersList = fieldsParameters.partNumbers.length > 2 ? fieldsParameters.partNumbers.reduce(reducer2) : '';

                let interchangePartNumberList = fieldsParameters.partNumbers.length > 1 ? fieldsParameters.partNumbers[1] : '';
                
                ebayOld.xmlRequest({
                    serviceName : 'Trading',
                    //opType : 'ReviseFixedPriceItem',
                    opType : 'ReviseItem',
                  
                    // app/environment
                    devId: resultMarketplace[0].devId,
                    certId: resultMarketplace[0].clientSecret,
                    appId: resultMarketplace[0].clientID,
                    sandbox: false,
                  
                    // per user
                    authToken: resultMarketplace[0].authToken,
                    params: {
                      'Item': {
                          'AutoPay': !result[0].bestOffer,
                          'BestOfferDetails': {
                            'BestOfferEnabled': result[0].bestOffer,
                          },
                          'ItemID': result[0].itemId,
                          'Quantity': fieldsParameters.quantity,
                          'StartPrice': fieldsParameters.price,
                          'Title': fieldsParameters.title,
                          'Description': fieldsParameters.description,
                          'PrimaryCategory': fieldsParameters.category.CategoryID,
                          'CategoryMappingAllowed': '1',
                          'PostalCode': '34945',
                          'ProductListingDetails': {
                              'BrandMPN': {
                                  'Brand': fieldsParameters.brand,
                                  'MPN': fieldsParameters.partNumbers[0]
                              }
                          },
                          'ItemSpecifics': {
                              'NameValueList': [
                                  {'Name': 'Brand', 'value': brandValue},
                                  {'Name': 'Manufacturer Part Number', 'value':fieldsParameters.partNumbers[0]},
                                  {'Name': 'Interchange Part Number', 'value': interchangePartNumberList},
                                  {'Name': 'Other Part Number', 'value':otherPartNumbersList},                                  
                                  {'Name': 'LOC', 'value': stringLocations},                                  
                              ],
                          },
                          'ConditionID': getConditionID(fieldsParameters.condition),
                          'ConditionDescription': fieldsParameters.conditionDescription,
                          'ShippingDetails': {
                             'ShippingType': getShippingType(fieldsParameters.domestic),
                             'ShippingServiceOptions': {
                                  'ShippingService': getShippingServiceCode(fieldsParameters.domestic),
                                  'FreeShipping': fieldsParameters.freeShipping,
                              },
                              'GlobalShipping': fieldsParameters.international === '1' ? true : false,
                          },                                              
                      },
                    }
                  }, function(error, results) {
                    console.log(results.Errors);

                    if (!results.Errors) {

            
                        Listing.updateOne({"sku": sku}, fieldsParameters, function(err, raw){
                            if (err) throw Error("Network Error!");
                            //console.log(raw);
                            res.send(raw);
                        });

                         const feedTempPrice = 
                         `<Message>
                         <MessageID>${Math.floor(Math.random()*100000)}</MessageID>
                         <OperationType>Update</OperationType>
                         <Price>
                         <SKU>${sku}</SKU>
                         <StandardPrice currency="USD">${fieldsParameters.price}</StandardPrice>
                         </Price>
                         </Message>`
 
                         const feedTempQuantity = 
                         `<Message>
                          <MessageID>${Math.floor(Math.random()*100000)}</MessageID>
                          <OperationType>Update</OperationType>
                          <Inventory>
                          <SKU>${sku}</SKU>
                          <Quantity>${fieldsParameters.quantity}</Quantity>
                          <FulfillmentLatency>1</FulfillmentLatency> 
                          </Inventory>
                          </Message>`
                          
                        let createDate = new Date;
                        console.log("*********************************** RESULT ASIN *******", result[0].asin);
                        if (result[0].asin !== undefined && result[0].asin !== ''){

                         const newAmazonRequest = new AmazonRequest({
                         id: uuidv4(),
                         amazonMarketplaceId: 'c7104e07-ed84-4a6c-b57b-1f333b197401',
                         asin: result[0].asin,
                         sku: sku,
                         timestamp: createDate,
                         template: '',
                         templatePrice: feedTempPrice.replace(/\s+/g,' ').trim(),
                         templateQuantity: feedTempQuantity.replace(/\s+/g,' ').trim(),
                         status: true,
                         statusPrice: false,
                         statusQuantity: false,
                         });
 
                         newAmazonRequest.save().then(() => {                                
                             console.log('Changed price and quantity');
                             changeListingAsinInDatabase(sku, result[0].asin);
                             //res.send(true)
                         
                             
                         
                         
                         });

                        }
                    
                    
                    
                    
                    
                    }
                
                
                
                })

            })
            
            })
    
        })

  })



  app.get('/getamazonasinlist/:amazonid/:sku', function(req, res){
    let sku = req.params.sku;
    let amazonid = req.params.amazonid;
    console.log("GET AMAZON ASIN LIST");
    //console.log(amazonid)

        
        amazonMarketplace.find({id:amazonid}, function(err, resultMarketplace){
            
            //console.log(sku);
            
            Listing.find({sku:sku}, function(err, resultListing){
                //console.log(resultListing[0].brand);
                if (resultListing.length > 0){
                Brand.find({id: resultListing[0].brand}, function(err, resultBrand){
                    //console.log("Brand:", resultBrand[0].value);
                    //console.log("Part Number:", resultListing[0].partNumbers[0]);
                    let brand = resultBrand[0].value;
                    let partNumber = resultListing[0].partNumbers[0];
                    let title = resultListing[0].title;

                    //let query = brand + ' ' + partNumber;
                
                    const reducer = (acc, curr) => acc + ' ' + curr;

                    let stringPartNumbers = resultListing[0].partNumbers.reduce(reducer);

                    let query = title + ' ' + stringPartNumbers;
                    
                    console.log(query);
                
                
                    amazonMws.products.search({
                        'Version': '2011-10-01',
                        'Action': 'ListMatchingProducts',
                        'SellerId': resultMarketplace[0].sellerID,
                        'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
                        'MarketplaceId': resultMarketplace[0].marketplaceID,
                        'Query': query,
                    }).then(function (response) {
                        
                        if (response.Products.Product.length > 0){
                        
                        let productsFound = response.Products.Product.filter(item => {
                            
                            //return item.AttributeSets.ItemAttributes.PartNumber === partNumber
                            return item
                            //return {identifiers: item.Identifiers.MarketplaceASIN.ASIN, information: item.AttributeSets.ItemAttributes}
                            //return item
                        
                        
                        })        
                        res.send(productsFound);
                        } else {
                            productsFound = response.Products.Product;
                            res.send([productsFound]);
                        }
                    
                    }).catch(function (error) {
                        console.log('error products', error);
                    });
                
                });
                } else {
                    res.send([]);
                }
            })

        });


    }
    
  );


  app.get('/getamazonasinlistbyquery/:amazonid/:query', function(req, res){
    let query = req.params.query;
    let amazonid = req.params.amazonid;
    console.log("GET AMAZON ASIN LIST BY QUERY");
    //console.log(amazonid)

        
        amazonMarketplace.find({id:amazonid}, function(err, resultMarketplace){
            
            //console.log(sku);
            
            
                    console.log(query);
                
                
                    amazonMws.products.search({
                        'Version': '2011-10-01',
                        'Action': 'ListMatchingProducts',
                        'SellerId': resultMarketplace[0].sellerID,
                        'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
                        'MarketplaceId': resultMarketplace[0].marketplaceID,
                        'Query': query,
                    }).then(function (response) {
                        
                        if (response.Products.Product.length > 0){
                        
                        let productsFound = response.Products.Product.filter(item => {
                            
                            //return item.AttributeSets.ItemAttributes.PartNumber === partNumber
                            return item
                            //return {identifiers: item.Identifiers.MarketplaceASIN.ASIN, information: item.AttributeSets.ItemAttributes}
                            //return item
                        
                        
                        })        
                        res.send(productsFound);
                        } else {
                            productsFound = response.Products.Product;
                            console.log(productsFound);
                            res.send([productsFound]);
                            //res.send([]);
                        }
                    
                    }).catch(function (error) {
                        console.log('error products', error);
                        res.send([]);
                    });

                });
             

        


    });

    app.get('/getamazonasinlistautoparts/:amazonid/:query', function(req, res){
        let query = req.params.query;
        let amazonid = req.params.amazonid;
        console.log("GET AMAZON ASIN LIST BY QUERY");
        //console.log(amazonid)
    
            
            amazonMarketplace.find({id:amazonid}, function(err, resultMarketplace){
                
                //console.log(sku);
                
                
                        console.log(query);
                    
                    
                        amazonMws.products.search({
                            'Version': '2011-10-01',
                            'Action': 'ListMatchingProducts',
                            'SellerId': resultMarketplace[0].sellerID,
                            'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
                            'MarketplaceId': resultMarketplace[0].marketplaceID,
                            'Query': query,
                        }).then(function (response) {
                            
                            if (response.Products.Product.length > 0){
                            
                            let productsFound = response.Products.Product.filter(item => {
                                
                                //return item.AttributeSets.ItemAttributes.PartNumber === partNumber
                                return item.AttributeSets.ItemAttributes.ProductGroup === 'Automotive Parts and Accessories'
                                //return {identifiers: item.Identifiers.MarketplaceASIN.ASIN, information: item.AttributeSets.ItemAttributes}
                                //return item
                            
                            
                            })        
                            res.send(productsFound);
                            } else {
                                productsFound = response.Products.Product;
                                console.log(productsFound);
                                res.send([productsFound]);
                                //res.send([]);
                            }
                        
                        }).catch(function (error) {
                            console.log('error products', error);
                            res.send([]);
                        });
    
                    });
                 
    
            
    
    
        });
    
app.get('/getonlypictures', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    console.log("GET LISTINGS");

    Listing.find({},'uuid pictures', function(err, result){
        //res.send(result);
        res.json(result);
    });
    /*MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
      if (err) throw err;
      console.log("Connected successfully to server");
     
      const db = client.db(dbName);
      const query = { "ManufacturePartNumber": partNumber };
  
      db.collection("epids").find(query).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
          console.log(result);
          client.close();
      });
    }); */
  });
  

app.get('/getlistings', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    console.log("GET LISTINGS");

    Listing.find({},{
        compatibilityManual: 0, 
        compatibilityEbayId: 0,
        //pictures: 0,
        /*conditionDescription: 0,
        bestOffer: 0,
        freeShipping: 0,
        domestic: 0,
        international: 0,
        length: 0,
        width: 0,
        depth: 0,
        weight: 0,
        weightUnit: 0,*/

    }, function(err, result){
        //res.send(result);
        res.json(result);
    });
    /*MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
      if (err) throw err;
      console.log("Connected successfully to server");
     
      const db = client.db(dbName);
      const query = { "ManufacturePartNumber": partNumber };
  
      db.collection("epids").find(query).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
          console.log(result);
          client.close();
      });
    }); */
  });

  function getMatchingProducts(sellerID, mwsAuthToken, marketplaceID, query){

    amazonMws.products.search({
        'Version': '2011-10-01',
        'Action': 'ListMatchingProducts',
        'SellerId': sellerID,
        'MWSAuthToken': mwsAuthToken,
        'MarketplaceId': marketplaceID,
        'Query': query,
    }).then(function (response) {
        

        console.log(response.Products.Product);        
        
    
    }).catch(function (error) {
        console.log('error products', error);
    });

}

  

function interval(func, wait, times){
    var interv = function(w, t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }
                catch(e){
                    t = 0;
                    throw e.toString();
                    //next(e);
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
};



//let mytime = setInterval(checkAmazonOrders, 60000);
//let mytime2 = setInterval(getEbayOrderItems, 600000);

setInterval(checkAmazonOrders, 120000);
setInterval(newGetEbayOrderItems, 5000);
setInterval(reviseEbayOrders, 10000);
setInterval(reviseAmazonOrders, 30000);
setInterval(reviseAmazonRequests, 360000);
setInterval(reviseAmazonPriceRequests, 340000);
setInterval(reviseAmazonQuantityRequests, 320000);

function changeQtyInDatabase(sku, qty, orderId){
        
    Listing.find({"sku": sku}, function(err, result){
        
      if (result.length > 0){

        let qtyStock = Number(result[0].quantity);
        let remaining = qtyStock - Number(qty);
        console.log(remaining);
        
        
        Listing.updateOne({"sku": sku}, {"quantity": remaining, "lastModified": new Date, "status": Number(remaining) > 0 ? 'online' : 'offline'}, 
        function(err,raw){
            
            if (err) throw new Error("Network Error!");
            console.log(raw);

            EbayOrder.update({"orderItemId": orderId}, {"checked": true}, function(err, raw){
                if (err) throw Error("Network Error!");
                console.log(raw);

            });

            changeQtyInAmazon(sku, remaining);

        });
        
      } else {
        EbayOrder.update({"orderItemId": orderId}, {"checked": true}, function(err, raw){
            if (err) throw Error("Network Error!");
            console.log(raw);
        });
          
      }
        
        
    });
}




function changeQtyInEbay(sku, qty, orderId){
        
    Listing.find({"sku": sku}, function(err, result){
        
      if (result.length > 0){

        let qtyStock = Number(result[0].quantity);
        let remaining = qtyStock - Number(qty);
        console.log(remaining);
        
        
        Listing.updateOne({"sku": sku}, {"quantity": remaining, "lastModified": new Date, "status": Number(remaining) > 0 ? 'online' : 'offline'}, 
        function(err,raw){
            
            if (err) throw new Error("Network Error!");
            console.log(raw);

            AmazonOrder.updateOne({"orderItemId": orderId}, {"checked": true}, function(err, raw){
                if (err) throw Error("Network Error!");
                console.log(raw);

            });

        });

            let ebayAccount = result[0].ebayAccount;
            let stringLocations = '';
            
            ebayMarketplace.find({"id": ebayAccount}, function(err, resultMarketplace){


             if (remaining > 0){

                ebayOld.xmlRequest({
                    serviceName : 'Trading',
                    opType : 'ReviseItem',
                  
                    // app/environment
                    devId: resultMarketplace[0].devId,
                    certId: resultMarketplace[0].clientSecret,
                    appId: resultMarketplace[0].clientID,
                    sandbox: false,
                  
                    // per user
                    authToken: resultMarketplace[0].authToken,
                    params: {
                      'Item': {
                          'ItemID': result[0].itemId,
                          'Quantity': remaining,                                              
                      },
                    }
                  }, function(error, results) {
                    console.log(results.Errors);

                    if (!results.Errors) {


                    }
                })
            } else {
                ebayOld.xmlRequest({
                    serviceName : 'Trading',
                    opType : 'EndFixedPriceItem',
                  
                    // app/environment
                    devId: resultMarketplace[0].devId,
                    certId: resultMarketplace[0].clientSecret,
                    appId: resultMarketplace[0].clientID,
                    sandbox: false,
                  
                    // per user
                    authToken: resultMarketplace[0].authToken,
                    params: {
                          'EndingReason': 'NotAvailable',
                          'ItemID': result[0].itemId,                                                                        
                    }
                  }, function(error, results) {
                    console.log(results.Errors);

                    if (!results.Errors) {


                    }
                })
            }


        });


        
      } else {
        AmazonOrder.updateOne({"orderItemId": orderId}, {"checked": true}, function(err, raw){
            if (err) throw Error("Network Error!");
            console.log(raw);
        });
     
        }
        
     
    });
}



function changeQtyInAmazon(sku, quantity){
    Listing.find({"sku": sku}, function(err, result){
        //let qtyStock = Number(result[0].quantity);
        //let remaining = qtyStock - Number(qty);
        
        if (result.length > 0){
        
        const feedTempQuantity = 
        `<Message>
         <MessageID>${Math.floor(Math.random()*100000)}</MessageID>
         <OperationType>Update</OperationType>
         <Inventory>
         <SKU>${sku}</SKU>
         <Quantity>${quantity}</Quantity>
         <FulfillmentLatency>1</FulfillmentLatency> 
         </Inventory>
         </Message>`
         
       let createDate = new Date;
       console.log("*********************************** RESULT ASIN *******", result[0].asin);
       if (result[0].asin !== undefined && result[0].asin !== ''){

        const newAmazonRequest = new AmazonRequest({
        id: uuidv4(),
        amazonMarketplaceId: 'c7104e07-ed84-4a6c-b57b-1f333b197401',
        asin: result[0].asin,
        sku: sku,
        timestamp: createDate,
        template: '',
        templatePrice: '',
        templateQuantity: feedTempQuantity.replace(/\s+/g,' ').trim(),
        status: true,
        statusPrice: true,
        statusQuantity: false,
        });

        newAmazonRequest.save().then(() => {                                
            console.log('Changed quantity in Amazon');
            //changeListingAsinInDatabase(sku, 'pending');
            //res.send(true)
        
            
        
        
        });

       }

    }


    })

}



function changeListingAsinInDatabase(sku, value){
    
    Listing.updateOne({"sku": sku}, {"asin": value}, function(err, raw){
                if (err) throw Error("Network Error!");
                console.log(raw);
    });
   
}

function changeAmazonRequestInDatabase(id){
    
    AmazonRequest.updateOne({"id": id}, {"status": true}, function(err, raw){
                if (err) throw Error("Network Error!");
                console.log(raw);

    });
   
}

function changeAmazonRequestPriceInDatabase(id){
    
    AmazonRequest.updateOne({"id": id}, {"statusPrice": true}, function(err, raw){
                if (err) throw Error("Network Error!");
                console.log(raw);

    });
   
}

function changeAmazonRequestQuantityInDatabase(id){
    
    AmazonRequest.updateOne({"id": id}, {"statusQuantity": true}, function(err, raw){
                if (err) throw Error("Network Error!");
                console.log(raw);

    });
   
}





function reviseAmazonRequests(){
    AmazonRequest.find({"status": false}, function(err, result){
        
        
        let lista1 = result.map(item => {
            return item.template
        })
        
        if (lista1.length > 0){

        const reducer = (acc, curr) => acc + curr;

        let bulkMessages = lista1.reduce(reducer);

        let headFeed = `<?xml version="1.0" encoding="iso-8859-1"?><AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd"><Header><DocumentVersion>1.01</DocumentVersion><MerchantIdentifier>AMXNXR0LS8KWP</MerchantIdentifier></Header><MessageType>Product</MessageType><PurgeAndReplace>false</PurgeAndReplace>`

        let feedContent = headFeed.trim()+bulkMessages+'</AmazonEnvelope>';
        
        console.log(feedContent);
        
        amazonMarketplace.find({'id':result[0].amazonMarketplaceId}, function(err, resultMarketplace){

        console.log("****************************", result[0].amazonMarketplaceId);    
        console.log("********************************", resultMarketplace[0].sellerID);

        var feedRequest = function () {

        amazonMws.feeds.submit({
            'Version': '2009-01-01',
            'Action': 'SubmitFeed',
            'FeedType': '_POST_PRODUCT_DATA_',
            'FeedContent': feedContent,
            'SellerId': resultMarketplace[0].sellerID,
            'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
        }, function (error, responseFeed) {
            if (error) {
                console.log('error ', error);
                return;
            }
            console.log('response', responseFeed);

            result.forEach(item => {
                changeAmazonRequestInDatabase(item.id);
                changeListingAsinInDatabase(item.sku, 'pending');
            });
        
        });

        }

        

        feedRequest();

    
        })

    }


    });
    
}

function reviseAmazonPriceRequests(){
    AmazonRequest.find({"status": true, "statusPrice": false}, function(err, result){
        
        
        let lista1 = result.map(item => {
            return item.templatePrice
        })
        
        if (lista1.length > 0){

        const reducer = (acc, curr) => acc + curr;

        let bulkMessages = lista1.reduce(reducer);

        let headFeed = `<?xml version="1.0" encoding="iso-8859-1"?><AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd"><Header><DocumentVersion>1.01</DocumentVersion><MerchantIdentifier>AMXNXR0LS8KWP</MerchantIdentifier></Header><MessageType>Price</MessageType>`;

        let feedContent = headFeed.trim()+bulkMessages+'</AmazonEnvelope>';
        
        console.log(feedContent);
        
        amazonMarketplace.find({'id':result[0].amazonMarketplaceId}, function(err, resultMarketplace){

        console.log("****************************", result[0].amazonMarketplaceId);    
        console.log("********************************", resultMarketplace[0].sellerID);

        var feedRequest = function () {

        amazonMws.feeds.submit({
            'Version': '2009-01-01',
            'Action': 'SubmitFeed',
            'FeedType': '_POST_PRODUCT_PRICING_DATA_',
            'FeedContent': feedContent,
            'SellerId': resultMarketplace[0].sellerID,
            'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
        }, function (error, responseFeed) {
            if (error) {
                console.log('error ', error);
                return;
            }
            console.log('response', responseFeed);

            result.forEach(item => {
                changeAmazonRequestPriceInDatabase(item.id);
                changeListingAsinInDatabase(item.sku, 'pending');
            });
        
        });

        }

        feedRequest();

    
        })

    }


    });
    
}

function reviseAmazonQuantityRequests(){
    AmazonRequest.find({"status": true, "statusPrice": true, "statusQuantity": false}, function(err, result){
        
        
        let lista1 = result.map(item => {
            return item.templateQuantity
        })
        
        if (lista1.length > 0){

        const reducer = (acc, curr) => acc + curr;

        let bulkMessages = lista1.reduce(reducer);

        let headFeed = `<?xml version="1.0" encoding="iso-8859-1"?><AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd"><Header><DocumentVersion>1.01</DocumentVersion><MerchantIdentifier>AMXNXR0LS8KWP</MerchantIdentifier></Header><MessageType>Price</MessageType>`;

        let feedContent = headFeed.trim()+bulkMessages+'</AmazonEnvelope>';
        
        console.log(feedContent);
        
        amazonMarketplace.find({'id':result[0].amazonMarketplaceId}, function(err, resultMarketplace){

        console.log("****************************", result[0].amazonMarketplaceId);    
        console.log("********************************", resultMarketplace[0].sellerID);

        var feedRequest = function () {

        amazonMws.feeds.submit({
            'Version': '2009-01-01',
            'Action': 'SubmitFeed',
            'FeedType': '_POST_INVENTORY_AVAILABILITY_DATA_',
            'FeedContent': feedContent,
            'SellerId': resultMarketplace[0].sellerID,
            'MWSAuthToken': resultMarketplace[0].mwsAuthToken,
        }, function (error, responseFeed) {
            if (error) {
                console.log('error ', error);
                return;
            }
            console.log('response', responseFeed);

            result.forEach(item => {
                changeAmazonRequestQuantityInDatabase(item.id);
                changeListingAsinInDatabase(item.sku, item.asin);
            });
        
        });

        }

        feedRequest();

    
        })

    }


    });
    
}


function reviseEbayOrders(){
    EbayOrder.find({"checked": false}, function(err, result){
        //console.log(result);
        result.forEach(item => {
            let orderId = item.orderItemId;
            let sku = item.sellerSKU;
            let qty = item.quantityOrdered;
            //console.log(sku);
            console.log(orderId);
            console.log("EBAY: " + sku);

            changeQtyInDatabase(sku, qty, orderId);
            //changeQtyInAmazon(sku);
        })
    
    });
    
}

function reviseAmazonOrders(){
    AmazonOrder.find({"checked": false}, function(err, result){
        //console.log(result);
        result.forEach(item => {
            let orderId = item.orderItemId;
            let sku = item.sellerSKU;
            let qty = item.quantityOrdered;
            //console.log(sku);
            console.log(orderId);
            console.log("AMAZON: " + sku);

            changeQtyInEbay(sku, qty, orderId);
            //changeQtyInAmazon(sku);
        })
    
    });
    
}


function checkAmazonOrders() {

    let date1 = new Date();
    let date2 = new Date(date1.setUTCDate(date1.getDate()-70)).toISOString();
    console.log("* CHEEEEEEEECK AMAZON ORRRRRRRDERS ************** " + date2);

    amazonMws.orders.search({
        'Version': '2013-09-01',
        'Action': 'ListOrders',
        'SellerId': SELLER_ID,
        'MWSAuthToken': MWS_AUTH_TOKEN,
        'MarketplaceId.Id.1': MARKETPLACE_ID_1,
        'CreatedAfter': date2,
        'OrderStatus.Status.1': 'Unshipped',
        'OrderStatus.Status.2': 'PartiallyShipped',

        //'CreatedAfter': '2018-09-01T12:00:00',    
      
        //'OrderStatus.Status.1': 'Shipped',
      }, function (error, response) {
            if (error) {
                console.log('error ', error);
                return;
            }  
            
            console.log(response.Orders.Order);
            if (response.Orders.Order.length > 0){

            let amazonIds = response.Orders.Order.map(item => {
                return item.AmazonOrderId;
            })
    
            amazonIds.forEach((item) => {
                getAmazonOrderItems(item);
            });
          }  
        });
}

function createAmazonLabel(sku, orderId, qtyOrdered){

    const label = new amazonLabel({
      uuid: uuidv4(),
      timestamp: new Date(),
      orderId: orderId,
      sku: sku,
      //title: listing.title,
      qtyOrdered: qtyOrdered,
      //brand: listing.brand,
      //partNumber: listing.partNumbers[0],
      //location: listing.location,
      //price: listing.price,
      //firstPicture: listing.pictures[0],
      //lastPicture: listing.pictures[listing.pictures.length - 1],
      checked: false,
    })
  
    label.save().then(() => {                                
      console.log('New Amazon Label created');
    });
  }

function getAmazonOrderItems(amazonOrderId) {
    
    amazonMws.orders.search({
        'Version': '2013-09-01',
        'Action': 'ListOrderItems',
        'SellerId': SELLER_ID,
        'MWSAuthToken': MWS_AUTH_TOKEN,
        'AmazonOrderId': amazonOrderId,
    }, function (error, response){
        if (error) {
            console.log('error ', error);
            return;
        }
                
        
        let result = {OrderItemId: response.OrderItems.OrderItem.OrderItemId,
            SellerSKU: response.OrderItems.OrderItem.SellerSKU,
            QuantityOrdered: response.OrderItems.OrderItem.QuantityOrdered}
        
        //console.log(result);
        
        const order = new AmazonOrder({ 
            orderItemId: response.OrderItems.OrderItem.OrderItemId,
            sellerSKU: response.OrderItems.OrderItem.SellerSKU,
            quantityOrdered: response.OrderItems.OrderItem.QuantityOrdered,
            checked: false,  
        });
        
        AmazonOrder.countDocuments({orderItemId: response.OrderItems.OrderItem.OrderItemId}, function(err, c){
            if (c < 1){
                order.save().then(() => {
                    console.log('Order Amazon Saved');
                    createAmazonLabel(response.OrderItems.OrderItem.SellerSKU, response.OrderItems.OrderItem.OrderItemId, response.OrderItems.OrderItem.QuantityOrdered);
                });
            }
        })
        
    })
};

 function newGetEbayOrderItems(){

    /*let ebay_refresh = new Ebay({
        clientID: 'OrrShlom-surplus3-PRD-9246ab013-0bb7ceb6',
        clientSecret: 'PRD-246ab013c215-6e44-4a97-a4db-107e',
        body: {
            'grant_type': 'refresh_token',
            'refresh_token': REFRESH_TOKEN,
            'scope':'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
            }
    })*/

    let n = '250';

    console.log("**** GET EBAY ORDERS ****");

    isOnline().then(online => {
        //console.log(online);

    if (online === true){


    ebayMarketplace.find({}, function(err, result){
    
        result.forEach(item => {
            let ebay_refresh = new Ebay({
                clientID: item.clientID,
                clientSecret: item.clientSecret,
                body: {
                    'grant_type': 'refresh_token',
                    'refresh_token': item.refreshToken,
                    'scope':'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
                    }            
            
            


            
            })
        
            ebay_refresh.getAccessToken().then((data) => {
                //console.log(data); // data.access_token
                
                let config = {
                    headers: {
                        //"Authorization": 'Bearer ' + 'v^1.1#i^1#p^3#f^0#r^0#I^3#t^H4sIAAAAAAAAAOVYW2wUVRju9gIWWvCBCCkYl6kkFjK7c2Zmdy6yC9t2G1Zou+2WqigscznTDp2d2cyZoSxirFVrggiJEBWiTRMgiOHWRGOiPJCqiMZoNPIgSrwgwYR4iQmgCTTObLdlW5XalsQm9qWZc/7b9/3ff/bMEF0zSpf2rOq5Vu6ZWdjXRXQVejxgNlE6o2TZnKLCipICIs/A09d1b1dxd9GPy5GQ0tJ8M0RpQ0fQuyWl6YjPLoYw29R5Q0Aq4nUhBRFvSXwiUr+GJ30EnzYNy5AMDfPGakMYKQUkwLKQhAzHioBxVvXhmC1GCBNYQLMUSQakYJASOODsI2TDmI4sQbccfwKwOCBwEGwBHE8Dngj4SI5ch3lboYlUQ3dMfAQWzpbLZ33NvFpvXaqAEDQtJwgWjkXqEo2RWG20oWW5Py9WOMdDwhIsG41+qjFk6G0VNBveOg3KWvMJW5IgQpg/PJRhdFA+MlzMJMrPUk2LJKlIQKSDhMKIpHJbqKwzzJRg3boOd0WVcSVrykPdUq3MeIw6bIiboGTlnhqcELFar/uvyRY0VVGhGcKi1ZGH1yaizZg3EY+bxmZVhrKLFACWIIMMR3NY2GqHSWSbac1GyTbVAZpLNhQxR/WYbDWGLqsuccjbYFjV0KkcjuWHyuPHMWrUG82IYrlV5dmRYJhHll3nNnaok7bVrru9hSmHDG/2cfwuDMviphBulzAULqAwLBsQWYoWGAWOEoY765MUR9jtTyQe97u1QFHI4CnB7IBWWhMkiEsOvXYKmqrMUwGFpFgF4nKQU3CaUxRcDMhBHCgQEhCKosSx/zeNWJapirYFR3QydiMLNIS5vPKqoPCW0QH1lkwaYmMts0dQThxbUAhrt6w07/d3dnb6OimfYbb5SYIA/ofq1ySkdpgSsBFbdXxjXM3KRHJU49jzllNACNviqNBJrrdh4eZoXXM0sSrZ0rg62jCs4FGVhceu/gPShGSkYdzQVCkzvSBSphwXTCuTgJrmLEwJJHJB/lfw3Fn/e4huDOQEEdKqz1WcTzJSfkNwTi53KZmt2vtvjPzIIck3dA44kX0mFGRD1zKTcZ6Aj6pvdkbIMDOTSTjiPAEfQZIMW7cmky7nOgEPxdYUVdPcU2IyCfPcJ1KmLmgZS5XQSMopCT+STsdSKdsSRA3G5Ok14CTFAIabMrxphcqddSzcaJqJds1I4bmfPwqPN9fiHEkHBZEAFE6IIiNBMTgl7PVt6rSCjoUZAAIUxQRogghMCVot3Dy92oqFAwrHQjog4wGGhDhNyxzOMUERp6DIAkoioMwxU8Jco6nOSTH9bhqrDGRBeWrQnGvx9ALljuPwNEokCOBBSNM4LXAMLtCy6NwhGTgu5OLqHOgxhnl3y7+8WvhHv9+HC7J/oNvzJtHt6S/0eAg/sQRUEotnFK0tLiqrQKoFfc491IfUNt15bTWhrwNm0oJqFs7wPLLoxOFk3heFvvXEgpFvCqVFYHbeBwZi0c2dEjB3fjlgAQGCgKMBEVhHVN7cLQZ3Fc+7uvbiVzcu7OuYcwe5v33g5M+9W9s2EOUjRh5PSUFxt6fA3rXw7Y0bZy7uXPnLioX7Bp5Pv7z+2tPGke2zLu++r9Lz+rbjm5b8/l3Pp327elsH70wOzvxyb9slsv/jb587uHvxGzWV7/T98UX/Hi+8vwydvLzsetXe6v7PsfiJqmeDG472nVjDn3rv4EcH6usSVQ90zXpwT2vvjfO7P+BPvyge+u39i2erFxjnOvhkFPuh/7UDr6zo3P943Y63mnr7nnnspfVxTyU6vqNpXsW9vw6U9ZQci77A/LTywrEP55yjt15JsmcePfpq6Myl7Z9o5y+fPXwFzL962l59vRMod5899NnpTd9bdLz0SGVN+c4L22I9BwbfbUgZT+6sEgeeuKd89ddLi55qGvzmZNmpYMXcofb9Cd57puPrEQAA',
                        "Authorization": 'Bearer ' + data.access_token,
                        "Content-Type": "application/json",
                    },
                    
                  }
        
                  //axios.get('https://api.ebay.com/sell/fulfillment/v1/order?limit='+n+'&offset=0', config)
                  axios.get('https://api.ebay.com/sell/fulfillment/v1/order?limit='+n+'&offset=0', config)
                  .then(response => {
                  const ordersList = response.data.orders;
                  //console.log(response.data.orders[1].lineItems);
                  ordersList.forEach((item) => {
                      const orderPaymentStatus = item.orderPaymentStatus;
                      const cancelState = item.cancelStatus.cancelState;
                      const creationDate = item.creationDate;
                      item.lineItems.forEach((lineItem )=> {
                          const lineItemFulfillmentStatus = lineItem.lineItemFulfillmentStatus;
                          const lineItemId = lineItem.lineItemId;
                          const legacyItemId = lineItem.legacyItemId;
                          const sku = lineItem.sku;
                          const quantity = lineItem.quantity;
        
                          //console.log({lineItemFulfillmentStatus, cancelState, lineItemId, legacyItemId, sku, quantity, orderPaymentStatus});            
                      
                          const order = new EbayOrder({ 
                              orderItemId: lineItemId,
                              creationDate: creationDate,
                              sellerSKU: sku,
                              ebayId: legacyItemId,
                              quantityOrdered: quantity,
                              checked: false,  
                          });
                          
                          EbayOrder.countDocuments({orderItemId: lineItemId}, function(err, c){
                              if (c < 1 && orderPaymentStatus === 'PAID' && cancelState === 'NONE_REQUESTED' && lineItemFulfillmentStatus === 'NOT_STARTED'){
                                  order.save().then(() => console.log('Order Ebay Saved'));
                              }
                          })
                      
                      
                      })            
                  })
                  //console.log(ordersList);
              })
            .catch((error) => {
                console.log(error);
                
              });
                
            }, (error) => {
                 console.log(error);
            });
        
        })
    })
    

    } else {
        console.log("Server is Offline!");
    }

    })
}

function pageTemplate(pdfWriter){
    //cxt = pdfWriter.startPageContentContext(page);
    let page = pdfWriter.createPage(0,0,600,400);
    let cxt = pdfWriter.startPageContentContext(page);
    
    amazonLabel.find({"checked": false}, function(err, result){
        
       
        result.forEach(item => {
            //console.log(item.uuid);
            cxt.writeText(
                'Adios Amigos',        
                20,370,
                {
                    font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                    size:14,
                    colorspace:'gray',
                    color:0x00
                });
                cxt.writeText(
                    'Hola Amigos',        
                    20,320,
                    {
                        font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                        size:17,
                        colorspace:'gray',
                        color:0x00
                    });
                
                pdfWriter.writePage(page);

                

        })
    })
        //pdfWriter.end();
    
    
    
}

function renderPageLabels(pdfWriter){
    let page = pdfWriter.createPage(0,0,600,400);
    let cxt = pdfWriter.startPageContentContext(page);
    amazonLabel.find({"checked": false}, function(err, result){
        
       
        result.forEach(item => {
            //console.log(item.uuid);
            cxt.writeText(
                'Adios Amigos',        
                20,370,
                {
                    font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                    size:14,
                    colorspace:'gray',
                    color:0x00
                });
                cxt.writeText(
                    'Hola Amigos',        
                    20,320,
                    {
                        font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                        size:17,
                        colorspace:'gray',
                        color:0x00
                    });
                
                pdfWriter.writePage(page);

                

    })
})
}

function getBrandFromId(list, id){
        
    const result = list.filter((item) => item.id === id);

    if (result.length > 0){
        return result[0].value
    } else {
        return null
    }
}


function getLocationFromId(list, id){
    const result = list.filter((item) => item.id === id);

    if (result.length > 0){
        return result[0].value;
    } else {
        return null
    }
    

    //return list.filter((item) => item.id === id)[0].value;
}

/*const reducer = (acc, curr) => acc + ' ' + curr;
         
stringLocations = fieldsParameters.locationValues.length > 0 ? fieldsParameters.locationValues.reduce(reducer) : '';
*/

function updateAmazonLabelsInfo(){
    amazonLabel.find({"checked": false}, function(err, result){
        for (let item of result){  
            Listing.find({"sku": item.sku}, function(err, resultListing){  
                
              Brand.find({}, function(err, resultBrands){  
                Location.find({}, function(err, resultLocations){
                
                let locationValues = [];
                try { 
                    locationValues = resultListing[0].location.map(itemLocation => {
                    //return getLocationFromId(resultLocations, itemLocation.id)
                    return getLocationFromId(resultLocations, itemLocation)
                })
                } catch {
                    locationValues = [];
                }
                
                let brandValue = "";
                try {
                    brandValue = getBrandFromId(resultBrands, resultListing[0].brand);
                } catch {
                    brandValue = "";
                }

                const reducer = (acc, curr) => acc + ' ' + curr;
                let stringLocations = locationValues.length > 0 ? locationValues.reduce(reducer) : '';
                
                amazonLabel.updateOne({"uuid": item.uuid}, 
                {
                    "title":resultListing[0].title,
                    "brand":resultListing[0].brand,
                    "partNumber":resultListing[0].partNumbers[0],
                    "location": stringLocations,
                    "brand": brandValue,
                    //"location": resultListing[0].location,
                    "price": resultListing[0].price,
                    "firstPicture": resultListing[0].pictures[0],
                    "lastPicture": resultListing[0].pictures[ resultListing[0].pictures.length - 1 ],
                    "remaining": resultListing[0].quantity,
                    //"lastPicture": resultListing[0].pictures[ resultListing.pictures.length - 1 ],
                }, function(err, raw){
                    if (err) throw Error("Network Error!");
                    //console.log(raw);
                    console.log(raw);
                });
            })

          })
        })

            

        }
    })
}
    //cxt = pdfWriter.startPageContentContext(page);
    
    //amazonLabel.find({"checked": false}, function(err, result){
        //console.log(result);
        //result.forEach((item) => {
            
         //pageTemplate(pdfWriter);
        
         //})
    //});
    
    //pageTemplate(pdfWriter, page, cxt);
    /*cxt.writeText(
        'NOS 1990 99 Ford Lincoln Mercury AXOD Converter Hub Oil Seal F2DZ-7F401-A',        
        20,370,
         {
            font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
            size:14,
            colorspace:'gray',
            color:0x00
         });
    pdfWriter.writePage(page);*/
    
function amazonLabelProcess(){
    amazonLabel.find({"checked": false}, function(err, result){
        if (result.length > 0){
        const filename = uuidv4();    
        let hummus = require('hummus');
        let pdfWriter = hummus.createWriter(new hummus.PDFWStreamForFile('./amazonPDF/'+filename + '.pdf'));
        
        
        
        //var pdfWriter2 = hummus.createWriter(new hummus.PDFStreamForResponse(res));
        
        console.log(result);
        //result.forEach(item => {
            //console.log(item.uuid);
            let n = 0;
            for (let item of result){
                n++;
                console.log(item);

                //var query = Listing.find({"sku":item.sku});
                
                //query.exec(function (erro, resultListing){

                let page = pdfWriter.createPage(0,0,600,400);
                //let cxt = pdfWriter.startPageContentContext(page);
              //Listing.find({"sku": item.sku}, function(err, resultListing){  
                //console.log(resultListing);
                //Listing.find({"sku": item.sku}).exec(
        
                /*let page = pdfWriter.createPage(0,0,600,400);*/
                let cxt = pdfWriter.startPageContentContext(page);
                
                if (item.firstPicture !== null){
                cxt.drawImage(380,220,'./pictures/'+item.firstPicture + '.jpg',
                {transformation:{width:200,height:200, proportional:true}});
                }

                if (item.lastPicture !== null){
                    cxt.drawImage(380,60,'./pictures/'+item.lastPicture + '.jpg',
                    {transformation:{width:200,height:200, proportional:true}});
                    }
                    cxt.writeText(
                        item.title.slice(0,40), //+ resultListing[0].title,        
                        20,350,
                        {
                            font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                            size:17,
                            colorspace:'gray',
                            color:0x00
                        });
                    cxt.writeText(
                        item.title.slice(40, item.title.length-1), //+ resultListing[0].title,        
                        20,320,
                        {
                            font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                            size:17,
                            colorspace:'gray',
                            color:0x00
                        });
                if (Number(item.qtyOrdered)>1){
                        cxt.writeText(
                            'Qty:', //+ resultListing[0].title,        
                            20,270,
                            {
                                font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                size:20,
                                colorspace:'gray',
                                color:0x00
                        });
                
                        cxt.writeText(
                            item.qtyOrdered, //+ resultListing[0].title,        
                            60,265,
                            {
                                font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                size:35,
                                colorspace:'red',
                                color:0x00
                        });
                }

                cxt.writeText(
                    item.location, //+ resultListing[0].title,        
                    20,230,
                    {
                        font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                        size:20,
                        colorspace:'gray',
                        color:0x00
                    });
                

                cxt.writeText(
                    'OrderID: ' + item.orderId,        
                    20,190,
                    {
                        font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                        size:14,
                        colorspace:'gray',
                        color:0x00
                    });
                    cxt.writeText(
                        'SKU: ' + item.sku, //+ resultListing[0].title,        
                        20,160,
                        {
                            font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                            size:14,
                            colorspace:'gray',
                            color:0x00
                        });
                    
                        
                            cxt.writeText(
                                'Brand: ' + item.brand, //+ resultListing[0].title,        
                                20,130,
                                {
                                    font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                    size:14,
                                    colorspace:'gray',
                                    color:0x00
                                });
                                cxt.writeText(
                                    'Part Number: ' + item.partNumber, //+ resultListing[0].title,        
                                    20,100,
                                    {
                                        font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                        size:14,
                                        colorspace:'gray',
                                        color:0x00
                                    });

                                    
                                        cxt.writeText(
                                            'Price: $' + item.price, //+ resultListing[0].title,        
                                            20,70,
                                            {
                                                font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                                size:14,
                                                colorspace:'gray',
                                                color:0x00
                                            });
                                            cxt.writeText(
                                                'Remaining: ' + item.remaining, //+ resultListing[0].title,        
                                                20,40,
                                                {
                                                    font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                                    size:14,
                                                    colorspace:'gray',
                                                    color:0x00
                                                });
                                                cxt.writeText(
                                                    'AMAZON (' + n + ')', //+ resultListing[0].title,        
                                                    250,20,
                                                    {
                                                        font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
                                                        size:14,
                                                        colorspace:'gray',
                                                        color:0x00
                                                    });

                  pdfWriter.writePage(page);
                    //});
                //});
                  //})
                  amazonLabel.updateOne({"uuid": item.uuid},{"checked": true}, function(err, raw){
                    if (err) throw Error("Network Error!");
                    //console.log(raw);
                    console.log(raw);
                });
                 
            }
            pdfWriter.end();
            
            
            
        //})
        //res.end();
        } /*else {
            res.send([]);
        }*/
    })
}
 

app.get('/pdf', function (req, res) {
    //res.writeHead(200, {'Content-Type': 'application/pdf'});
    //console.log(Date());    
    //const filename = uuidv4();
    //var hummus = require('hummus');
    //var pdfWriter2 = hummus.createWriter(new hummus.PDFStreamForResponse(res));
    //var pdfWriter = hummus.createWriter(new hummus.PDFWStreamForFile('./amazonPDF/'+filename + '.pdf'));
    
    
    //let page = pdfWriter.createPage(0,0,600,400);
    //let cxt = pdfWriter.startPageContentContext(page);

    updateAmazonLabelsInfo();

    /*amazonLabel.find({"checked": false}, function(err, resultOutside){
        for (let item of resultOutside){  
            Listing.find({"sku": item.sku}, function(err, resultListing){  
                amazonLabel.updateOne({"uuid": item.uuid}, {"title":resultListing[0].title}, function(err, raw){
                    if (err) throw Error("Network Error!");*/

    //amazonLabelProcess();     
           
    //setTimeout(amazonLabelProcessBrowser,2500, 'Good');                
    setTimeout(amazonLabelProcess,4000, 'Good');

    
    res.end();    

                    


/*});
})



}
})*/
    

    //res.end();

    
    //renderPageLabels(pdfWriter);
    
    //renderPageLabels(pdfWriter2);
    /*var page = pdfWriter.createPage(0,0,600,400);
    var page2 = pdfWriter2.createPage(0,0,600,400);
    
    cxt = pdfWriter.startPageContentContext(page);
    cxt2 = pdfWriter2.startPageContentContext(page2);
    
    
    cxt.writeText(
        'NOS 1990 99 Ford Lincoln Mercury AXOD Converter Hub Oil Seal F2DZ-7F401-A',        
        20,370,
         {
            font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
            size:14,
            colorspace:'gray',
            color:0x00
         });
    
    cxt2.writeText(
        'NOS 1990 99 Ford Lincoln Mercury AXOD Converter Hub Oil Seal F2DZ-7F401-A',        
        20,370,
         {
            font:pdfWriter.getFontForFile('./fonts/arial.ttf'),
            size:14,
            colorspace:'gray',
            color:0x00
         });

    pdfWriter.writePage(page);
    pdfWriter2.writePage(page2);*/
    
    //pdfWriter.end();   
    //pdfWriter2.end();   

    

    });
/*
function createPdfBinary(pdfDoc, callback) {

    var fontDescriptors = {
      Roboto: {
        normal: path.join(__dirname, '..', 'examples', '/fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '..', 'examples', '/fonts/Roboto-Medium.ttf'),
        italics: path.join(__dirname, '..', 'examples', '/fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '..', 'examples', '/fonts/Roboto-MediumItalic.ttf')
      }
    };
  
    var printer = new pdfMakePrinter(fontDescriptors);
  
    var doc = printer.createPdfKitDocument(pdfDoc);
  
    var chunks = [];
    var result;
  
    doc.on('data', function (chunk) {
      chunks.push(chunk);
    });
    doc.on('end', function () {
      result = Buffer.concat(chunks);
      callback('data:application/pdf;base64,' + result.toString('base64'));
    });
    doc.end();
  
  }*/


app.listen('8083')
console.log('Magic happens on port 8083');
exports = module.exports = app;