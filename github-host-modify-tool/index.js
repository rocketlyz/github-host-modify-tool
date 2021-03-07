const http = require('http');
const fs = require("fs");

const dnsUrl = "http://119.29.29.29/d?dn=raw.githubusercontent.com";
const hostUri = "/etc/hosts";
const targetHosts = [
    'raw.githubusercontent.com',
    'user-images.githubusercontent.com',
    'camo.githubusercontent.com',
];
const regex = /([0-9.]+)\s+(\S+)/ig;
let lastIp = '';

const replaceHost = (text, host, ip) => {
    const foundIndex = text.indexOf(host);
    if(foundIndex > -1) {
        return text.replace(regex, (match, p1, p2) => {
            if(p2 === host) {
                return `${ip} ${p2}`;
            } else {
                return `${p1} ${p2}`;
            }
        });
    } else {
        return `${text}\n${ip} ${host}`;
    }
}

const modifyHosts = (ip) => {
    try {
        let text = fs.readFileSync(hostUri, 'utf-8');
        
        targetHosts.forEach(host => {
            text = replaceHost(text, host, ip);
        });
        fs.writeFileSync(hostUri, text, 'utf-8');
        console.log("修改github成功，新ip为: " + ip);
    } finally {
        
    }
}

const run = () => {
    http.get(dnsUrl, (res) => {
        res.setEncoding("utf-8");
        let result = "";
        res.on('data', (chunk) => {
            result += chunk;
        });
        res.on('end', () => {
           const ip = result.split(";").pop();
           if(ip) {
               if (lastIp !== ip) {
                    modifyHosts(ip);
                    lastIp = ip;
               } else {
                    console.log('ip暂时没有变动');
               }
           } else {
               console.warn('没有获取到ip');
           }
        });
    }).on("error", (e) => {
        console.error(e.message);
    });
};

run();
setInterval(run, 60*60*1000);
