var express = require('express');
var router = express.Router();
var depts = require('../bin/departments');
var listingsModels = require('../models/listings.js');
var hbs = require('hbs');
var paginate = require('handlebars-paginate');

hbs.registerHelper('paginate', paginate);
hbs.registerHelper('split-depts', function(str) {
    str = hbs.Utils.escapeExpression(str);
    for (var i = 0; i < str.length; i++) {
        str = str.replace(';', "</br>");
    }
    return new hbs.SafeString(str)
});

function listAll(req, res) {
    var callback = function(listings) {
        res.render('listings', {
            title: 'Listings',
            searchPlaceholder: req.query.search || '',
            deptPlaceholder: req.query.departments || 'Departments',
            depts: depts,
            listings: listings.slice((req.query.p - 1) * resultsPerPage || 0, req.query.p * resultsPerPage || resultsPerPage), //gets entries for current page
            pagination: {
                page: req.query.p || 1,
                pageCount: Math.ceil(listings.length / resultsPerPage)
            }
        });
    };
    var resultsPerPage = req.query.limit || 10;
    var maxresultsPerPage = 50;
    //set max resultsPerPage to 50
    if (req.query.limit > maxresultsPerPage) {
        resultsPerPage = maxresultsPerPage;
    }

    console.log(req.query.departments);

    if (req.query.search) {
        if (req.query.departments && req.query.departments!="Departments") {
            listingsModels.searchANDfilter(req.query.search, req.query.departments, callback);
        } else {
            listingsModels.searchListings(req.query.search, callback);
        }
    } else {
        if (req.query.departments && req.query.departments!="Departments"){
            listingsModels.filterDepts(req.query.departments, callback);
        } else {
            listingsModels.getAllListings(callback)
        }
    }
}

//GET home page.
router.get('/listings', listAll);

module.exports = router;
