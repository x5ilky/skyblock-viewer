"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let d;
let howmuchshow = 50;
let binonly = false;
let stopcalc = false;
function commaPrice(pr) {
    let price = pr.toFixed(0).toString();
    let newprice = "";
    for (let i = 0; i < price.length % 3; i++) {
        newprice += price[i];
    }
    if (price.length > 3 && price.length % 3 != 0)
        newprice += ',';
    let other = Math.floor(price.length / 3);
    for (let i = 0; i < other; i++) {
        newprice += price.slice(price.length % 3 + i * 3, price.length % 3 + i * 3 + 3);
        if (i != other - 1)
            newprice += ',';
    }
    let decimal = "";
    if (pr.toString().split(".")[1] !== undefined)
        decimal = '.' + pr.toString().split(".")[1];
    return newprice + decimal;
}
const parseLore = (lore) => {
    let newlore = "";
    let word = "";
    let color = "";
    let colors = [];
    for (let i = 0; i < lore.length; i++) {
        if (lore[i] === "§") {
            newlore += word;
            word = "";
            i++;
            color = lore[i];
            if (color === "r")
                for (let i = 0; i < colors.length; i++) {
                    newlore += "</span>";
                }
            else
                word += `<span class="c${color}">`;
            colors.push(color);
        }
        else {
            word += lore[i];
        }
    }
    newlore += word;
    for (let i = 0; i < colors.length; i++) {
        newlore += "</span>";
    }
    return "<div lore><br>" + newlore.replace(/\n/g, "<br>") + "</div>";
};
const correctRarity = (auc) => {
    let rarity = $$("#rarity").value;
    if (rarity === "NONE") {
        return true;
    }
    else {
        return auc.tier === $$("#rarity").value;
    }
};
const formatName = (auc) => {
    return `<span class="${auc.tier} star">${auc.item_name.split(/[➊➋➌➍➎✪]/g).join("")}</span><span class="ce star">${auc.item_name.replace(/[^✪]/g, "")}</span><span class="c4">${auc.item_name.replace(/[^➊➋➌➍➎]/g, "")}</span>`;
};
const correctBin = (isbin) => {
    let rarity = $$("#binonly").value;
    if (rarity === "both") {
        return true;
    }
    if (rarity === "auction")
        return isbin === false;
    else if (rarity === "bin")
        return isbin === true;
};
const sortAuctions = (filtered) => {
    console.log("sorting");
    let sortby = $$("#sort").value;
    if (sortby === "random")
        return filtered;
    else if (sortby === "lowest")
        return filtered.sort((a, b) => (getAuctionPrice(a) - getAuctionPrice(b)));
    else if (sortby === "highest")
        return filtered.sort((a, b) => -(getAuctionPrice(a) - getAuctionPrice(b)));
};
function getPrice(auc) {
    if (auc.bin)
        return `<span class="c6">Price: </span><span class="ce">${commaPrice(auc.starting_bid)}</span>`;
    else {
        let price = Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount));
        return `<span class="c6">Highest Bid: </span><span class="ce">${commaPrice(price)}</span>`;
    }
}
function getAuctionPrice(auc) {
    return Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount));
}
function correctLore(auc) {
    let val = $$('#loresearch').value.toLowerCase().split(",");
    for (let a of val) {
        if (!auc.item_lore.toLowerCase().includes(a))
            return false;
    }
    return true;
}
function correctStars(auc) {
    let val = $$("#stars").value;
    if (val === "any")
        return true;
    if (val === "no")
        return !auc.item_name.includes("✪");
    if (val === "✪")
        return auc.item_name.replace(/[^✪]/g, "").length === 1;
    if (val === "✪✪")
        return auc.item_name.replace(/[^✪]/g, "").length === 2;
    if (val === "✪✪✪")
        return auc.item_name.replace(/[^✪]/g, "").length === 3;
    if (val === "✪✪✪✪")
        return auc.item_name.replace(/[^✪]/g, "").length === 4;
    if (val === "✪✪✪✪✪")
        return auc.item_name.replace(/[^✪]/g, "").length === 5;
    else
        return auc.item_name.includes(val);
}
const updateAuctionBrowser = (data, reload = false) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("Updated auction browser");
    howmuchshow = $$("#show").value;
    $$(".auc").innerHTML = "";
    let filtered = data.auctions.filter(auc => {
        var _a;
        return auc.item_name.toLowerCase().includes($$('#search').value.toLowerCase())
            && correctRarity(auc)
            && correctBin((_a = auc.bin) !== null && _a !== void 0 ? _a : false)
            && correctLore(auc)
            && correctStars(auc);
    });
    filtered = (_a = sortAuctions(filtered)) !== null && _a !== void 0 ? _a : [];
    $$(".loaded").textContent = `${filtered.slice(0, howmuchshow).length} out of ${filtered.length}`;
    for (let auc of filtered.slice(0, howmuchshow)) {
        let elem = document.createElement('div');
        elem.className = "itempanel";
        elem.innerHTML = `<b>${formatName(auc)}</b> - ${getPrice(auc)}`;
        $$(".auc").appendChild(elem);
        elem.addEventListener("mouseenter", () => {
            let el = document.createElement("div");
            el.style.position = "absolute";
            el.classList.add("info");
            el.innerHTML = `${parseLore(auc.item_lore)}<br><span class="cd">Internal Id: </span><span class="c7">${auc.item_id}</span><br><span class="c6">Lowest Bin: </span><span class="ce lowestbin">Calculating...</span><br><span class="c6">Market Price: </span><span class="ce marketprice">Calculating...</span><br><span class="c6">Mean Price: </span><span class="ce meanprice">Calculating...</span>`;
            // [*] Extra Data Place
            elem.appendChild(el);
            position_tooltip(el);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                let low = yield getLowestBin(auc.item_id, data.auctions);
                $$(".lowestbin").textContent = commaPrice(low);
            }), 0);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                let low = yield getMarketPrice(auc.item_id, data.auctions);
                $$(".marketprice").textContent = commaPrice(low);
            }), 0);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                let low = yield getMeanPrice(auc.item_id, data.auctions);
                $$(".meanprice").textContent = commaPrice(low);
            }), 0);
        });
        elem.addEventListener("mouseleave", () => {
            $$all('.info').forEach((elem) => elem.remove());
            stopcalc = true;
        });
        elem.addEventListener('click', () => {
            var copyText = document.createElement("textarea");
            copyText.value = `/viewauction ${auc.uuid}`;
            // Select the text field
            copyText.select();
            copyText.setSelectionRange(0, 99999); // For mobile devices
            // Copy the text inside the text field
            navigator.clipboard.writeText(copyText.value);
            // Alert the copied text
            alert("Copied the text: " + copyText.value);
        });
    }
    if (!reload)
        updateAuctionBrowser(d, true);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    $$(".auc").innerHTML = "Fetching page data...";
    let res = yield fetch("https://api.hypixel.net/skyblock/auctions?page=0");
    let data = yield res.json();
    let aucs = [];
    $$(".alert").style.display = "block";
    let pages = data.totalPages;
    if (localStorage.getItem("dev") === "true")
        pages = 10;
    $$(".alert").textContent = "Downloading data: 0/" + pages;
    $$('#search').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(d), 0));
    $$('#rarity').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(d), 0));
    $$('#binonly').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(d), 0));
    $$('#stars').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(d), 0));
    $$('#show').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(d), 0));
    $$('#sort').addEventListener("change", () => setTimeout(() => { updateAuctionBrowser(d); console.log("test"); }, 0));
    $$('#loresearch').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(d), 0));
    let fetches = [];
    for (let i = 0; i < pages; i++) {
        fetches.push(fetch("https://api.hypixel.net/skyblock/auctions?page=" + i));
    }
    let loaded = 0;
    $$(".alert").textContent = "Downloading data - 0/" + pages;
    (yield Promise.all(fetches)).forEach((res) => __awaiter(void 0, void 0, void 0, function* () {
        let data = yield res.json();
        aucs.push(...data.auctions.map((d) => {
            d.item_id = parseNBT(d.item_bytes).value.i.value.value[0].tag.value.ExtraAttributes.value.id.value;
            return d;
        }));
        data.auctions = aucs;
        updateAuctionBrowser(data);
        d = data;
        loaded++;
        $$(".alert").textContent = "Downloading auction data - " + loaded + "/" + pages;
        if (loaded === pages)
            $$(".alert").style.display = "none";
    }));
    console.log(data);
}))();
function position_tooltip(el) {
    // Get .ktooltiptext sibling
    var tooltip = el;
    // Get calculated tooltip coordinates and size
    var tooltip_rect = tooltip.getBoundingClientRect();
    // Corrections if out of window
    if ((tooltip_rect.x + tooltip_rect.width) >= window.innerWidth) // Out on the right
        tooltip.style.transform = "translate(-100%, -100px)";
}
function $$(query) {
    return document.querySelector(query);
}
function $$all(query) {
    return document.querySelectorAll(query);
}
function parseNBT(bytes) {
    let atobed = atob(bytes).split("").map(c => c.charCodeAt(0));
    let deflated = pako.inflate(atobed);
    let parsed = nbt.parseUncompressed(deflated);
    return parsed;
}
function getLowestBin(itemid, auctions) {
    return __awaiter(this, void 0, void 0, function* () {
        let cheapest = 99999999999999;
        for (let auc of fil((a) => a.item_id === itemid, auctions)) {
            if (auc.bin && auc.starting_bid < cheapest) {
                cheapest = auc.starting_bid;
            }
        }
        return cheapest === 99999999999999 ? -1 : cheapest;
    });
}
const fil = (fn, a) => {
    const f = []; //final
    for (let i = 0; i < a.length; i++) {
        if (fn(a[i])) {
            f.push(a[i]);
        }
    }
    return f;
};
function getMarketPrice(itemid, auctions) {
    return __awaiter(this, void 0, void 0, function* () {
        let cheapest = 99999999999999;
        let prices = [];
        for (let auc of fil((a) => a.item_id === itemid, auctions)) {
            if (auc.bin) {
                if (auc.starting_bid < cheapest)
                    cheapest = auc.starting_bid;
                prices.push(auc.starting_bid);
            }
        }
        prices.sort();
        function median(values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (values.length === 0)
                    throw new Error("No inputs");
                values.sort(function (a, b) {
                    return a - b;
                });
                var half = Math.floor(values.length / 2);
                if (values.length % 2)
                    return values[half];
                return (values[half - 1] + values[half]) / 2.0;
            });
        }
        return cheapest === 99999999999999 ? -1 : ((yield median(prices)) + cheapest) / 2;
    });
}
function getMeanPrice(itemid, auctions) {
    return __awaiter(this, void 0, void 0, function* () {
        let s = 0;
        let n = 0;
        for (let auc of fil((a) => a.item_id === itemid, auctions)) {
            s += (auc.starting_bid);
            n++;
        }
        return parseInt((s / n).toFixed(2));
    });
}
