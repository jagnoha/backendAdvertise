let express = require('express');
let cors = require('cors');
let app     = express();
const ebayOld = require('ebay-api');
const fs = require('fs');
const axios = require("axios");
let Ebay = require("ebay-node-api");
let Xray = require('x-ray');
let multer  = require('multer');
let upload = multer({ dest: 'imagesa/' }); //setting the default folder for multer
//other imports and code will go here
var x = Xray().delay(1000);
var y = Xray().delay(1000);
const isOnline = require('is-online');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/uaintl',{ useNewUrlParser: true });
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

app.use('/images', express.static(__dirname + '/pictures'));
app.use('/amazonPDF', express.static(__dirname + '/amazonPDF'));

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

  app.get('/getbrands', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    console.log("GET BRANDS");

    Brand.find({}, function(err, result){
        res.send(result);

    });
    
  });

  app.get('/getlocations', function(req, res){
    //let partNumber = req.params.partNumber.toUpperCase();
    console.log("GET LOCATIONS");

    Location.find({}, function(err, result){
        res.send(result);

    });
    
  });

  app.get('/getebaymarketplaces', function(req, res){
    
    let id = req.params.id;
    
    console.log("GET EBAY MARKETPLACES");

    
        ebayMarketplace.find({}, function(err, result){
            res.send(result);

        });

      
    }
    
  );

  app.get('/getamazonmarketplaces', function(req, res){    
    let id = req.params.id;
    
    console.log("GET AMAZON MARKETPLACES");
    
        amazonMarketplace.find({}, function(err, result){
            res.send(result);

        });      

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


  app.get('/getlistings', function(req, res){
    
    
    console.log("GET LISTINGS");

    Listing.find({},{
        compatibilityManual: 0, 
        compatibilityEbayId: 0,        

    }, function(err, result){
        
        res.json(result);
    });
    
  });

  app.get('/getlisting/:sku', function(req, res){
    
    let sku = req.params.sku;

    console.log("GET LISTING " + sku);

    Listing.findOne({"sku":sku},function(err, result){
        
        res.json(result);
    });
    
  });

  
  app.post('/upload',upload.single('file'), (req, res,next) => {
        //logger.info(req.file);//this will be automatically set by multer
        //logger.info(req.body);
        //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
        fs.readFile(req.file.path,(err, contents)=> {
            if (err) {
                console.log('Error: ', err);
            } else {
                console.log('File contents ',contents);
                console.log(req.file.path);

                fs.rename(req.file.path, req.file.path + '.jpg', function (err) {
                    if (err) throw err;
                    console.log('renamed complete');
                });

            }
        });
  });


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





















app.listen('8083')
console.log('Magic happens on port 8083');
exports = module.exports = app;