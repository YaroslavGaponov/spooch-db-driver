#!/usr/bin/env node

/*
 * copyright (c) 2013 Yaroslav Gaponov <yaroslav.gaponov@gmail.com>
 */

var assert = require("assert");
var util = require("util");
var Storage = require("../index");

var RECORDS = 50000;
var CHUNKS = 10;

process.on("insert", function() {
    util.print("\n# inserting...\n");        
    var storage = new Storage(__dirname + "/db", CHUNKS);
    var processed = 0;
    storage.open(function(err, res) {        
        var start = (new Date).getTime();
        for(var i=0; i<RECORDS; i++) {                
            storage.set("test"+i, "hello world"+i, function(err, res) {
                assert.ifError(err);
                util.print("processing " + (100.0 * processed / RECORDS).toFixed(2) + "% \r");
                if (++processed === RECORDS) {
                    util.print("\nspeed " + (((new Date).getTime() - start) / RECORDS) + " ms per record\n");
                    storage.close(function() {
                        storage.disconnect();
                        process.emit("search");
                    });                
                }
            });
        }
    });
});


process.on("search", function() {
    util.print("\n# searching...\n");
    var storage = new Storage(__dirname + "/db", CHUNKS);
    var processed = 0;    
    storage.open(function(err, res) {        
        var start = (new Date).getTime();
        for(var i=0; i<RECORDS; i++) {                
            storage.get("test"+i,function(err, res) {
                assert.ifError(err);                
                util.print("processing " + (100.0 * processed / RECORDS).toFixed(2) + "% \r");
                if (++processed === RECORDS) {
                    util.print("\nspeed " + (((new Date).getTime() - start) / RECORDS) + " ms per record\n");
                    storage.close(function() {
                        storage.disconnect();
                        process.emit("remove");
                    });                
                }
            });
        }
    });    
});


process.on("remove", function() {
    util.print("\n# removing...\n");
    var storage = new Storage(__dirname + "/db", CHUNKS);
    var processed = 0;    
    storage.open(function(err, res) {
        var start = (new Date).getTime();
        for(var i=0; i<RECORDS; i++) {                
            storage.remove("test"+i,function(err, res) {
                assert.ifError(err);                
                util.print("processing " + (100.0 * processed / RECORDS).toFixed(2) + "% \r");
                if (++processed === RECORDS) {
                    util.print("\nspeed " + (((new Date).getTime() - start) / RECORDS) + " ms per record\n");
                    storage.close(function() {
                        storage.disconnect();
                        process.emit("done");
                    });                
                }
            });
        }
    });    
});


process.on("done", function() {
    process.exit();
});




process.emit("insert");