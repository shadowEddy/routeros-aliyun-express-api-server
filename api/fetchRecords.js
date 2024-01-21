const express = require("express");
const Core = require('@alicloud/pop-core');
const fetchRecords = express.Router();

const { getTime } = require("../util")

// build aliyun api client
const buildAliyunApiClient = (accessKeyId, accessKeySecret) => {
    var client = new Core({
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        endpoint: 'https://alidns.aliyuncs.com',
        apiVersion: '2015-01-09'
    });
    return client;
}

// parse domain
const parseDomain = (domain) => {
    return {
        subDomain: domain.split('.').slice(0, domain.split('.').length - 2).join('.'),
        mainDomain: domain.split('.').slice(-2).join('.'),
    }
}

// get domain records
const getDomainRecords = (subDomain, mainDomain, client) => {
    return new Promise((resolve, reject) => {
        var requestOption = {
            method: 'POST'
        };
        client.request("DescribeDomainRecords", {
            DomainName: mainDomain,
            RRKeyWord: subDomain,
        }, requestOption).then(res => {
            resolve(res.DomainRecords.Record);
        }).catch(e => {
            reject(e);
        })
    });
}

fetchRecords.post("/", async (req, res) => {
    try {
        if (!req.body.accessKeyId || !req.body.accessKeySecret || !req.body.DomainName) {
            throw new Error("imcomplete params received");
        }

        const { subDomain, mainDomain } = parseDomain(req.body.DomainName);

        // if no subdomain, send 2
        if (!subDomain) {
            throw new Error("no subdomain provided");
        }

        // build api client object
        client = buildAliyunApiClient(req.body.accessKeyId, req.body.accessKeySecret);
        const domainRecords = await getDomainRecords(subDomain, mainDomain, client);

        // if no record found send 2, else send the record
        if (!domainRecords.length) {
            console.log(getTime(), req.body.DomainName, "record doesn't exist")
            res.status(200).send("2");
        } else {
            var flag = 1;
            for (let i = 0; i < domainRecords.length; i++) {
                const item = domainRecords[i];

                if (item.Type = "A") {
                    console.log(getTime(), req.body.DomainName, "record found, send the record value");
                    flag = 0;
                    res.status(200).send(item.Value);
                }
            }
            if (flag) {
                throw new Error("no A record found");
            }
        }

    } catch (error) {
        console.log(getTime(), error.message);
        res.status(200).send("2");
    }
})

module.exports = fetchRecords;