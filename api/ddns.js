const express = require("express");
const Core = require('@alicloud/pop-core');
var ddns = express.Router();

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

// update records
const updateRecord = (id, subDomain, ip, client) => {
    return new Promise((resolve, reject) => {
        var requestOption = {
            method: 'POST'
        };
        client.request("UpdateDomainRecord", {
            RecordId: id,
            RR: subDomain,
            Type: "A",
            Value: ip
        }, requestOption).then(res => {
            resolve(res);
        }).catch(e => {
            reject(e);
        })
    });
}

//add new record
const addRecord = (subDomain, mainDomain, ip, client) => {
    return new Promise((resolve, reject) => {
        var requestOption = {
            method: 'POST'
        };
        client.request("AddDomainRecord", {
            DomainName: mainDomain,
            RR: subDomain,
            Type: "A",
            Value: ip
        }, requestOption).then(res => {
            resolve(res);
        }).catch(e => {
            reject(e);
        })
    });
}

ddns.post("/", async (req, res) => {
    try {
        if (!req.body.accessKeyId || !req.body.accessKeySecret || !req.body.DomainName || !req.body.ip) {
            throw new Error("imcomplete params received");
        }

        const { subDomain, mainDomain } = parseDomain(req.body.DomainName);
        client = buildAliyunApiClient(req.body.accessKeyId, req.body.accessKeySecret);
        const domainRecords = await getDomainRecords(subDomain, mainDomain, client);

        // no record found, add record directly
        if (!domainRecords.length) {
            console.log(getTime(), req.body.DomainName, "record doesn't exist, adding...")
            await addRecord(subDomain, mainDomain, req.body.ip, client);
            console.log(getTime(), req.body.DomainName, "record added, dns record is pointing to ", req.body.ip);
            res.status(201).send("0");
        }

        // check if record exists
        for (let i = 0; i < domainRecords.length; i++) {
            const item = domainRecords[i];

            // record exists
            if (item.RR === subDomain) {
                const RecordId = item.RecordId;
                const RecordValue = item.Value;
                // recorded ip is the same as the new ip
                if (RecordValue === req.body.ip) {
                    console.log(getTime(), req.body.DomainName, "record is the same as the provided ip, no need to change");
                    res.status(200).send("1");
                // update record
                } else {
                    await updateRecord(RecordId, subDomain, req.body.ip, client);
                    console.log(getTime(), req.body.DomainName, "record updated, dns record is pointing to", req.body.ip);
                    res.status(201).send("0");
                }
            }
        }
    } catch (error) {
        console.log(getTime(), error.message);
        res.status(200).send("2");
    }
});

ddns.get("/test", async (req, res) => {
    try {
        console.log(req.query);
        const { subDomain, mainDomain } = parseDomain(req.query.DomainName);
        console.log(subDomain, mainDomain);
        res.status(200).send({ subDomain, mainDomain });
    } catch (error) {
        res.status(400);
    }
})

module.exports = ddns;