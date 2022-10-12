let d: AuctionPageResponse;
let howmuchshow = 50;
let binonly = false;
let stopcalc = false;
function commaPrice(pr: number) {
    let price = pr.toFixed(0).toString()
    let newprice = "";
    for (let i = 0; i < price.length%3; i++) {
        newprice += price[i]
    }
    if (price.length > 3 && price.length % 3 != 0) newprice += ','
    let other = Math.floor(price.length/3);
    for (let i = 0; i < other; i++) {
        
        newprice += price.slice(price.length%3 + i*3, price.length%3 + i*3 + 3)
        if (i != other-1) newprice += ','
    }
    let decimal = ""
    if (pr.toString().split(".")[1] !== undefined) decimal = '.' + pr.toString().split(".")[1]
    return newprice + decimal
}

const parseLore = (lore:string) => {
    let newlore = ""
    let word = ""
    let color = ""
    let colors: string[] = []
    for (let i = 0; i < lore.length; i++) {
        if (lore[i] === "§") {
            
            newlore += word
            word = ""
            
            i++;
            color = lore[i]
            if (color === "r") for (let i = 0; i < colors.length; i++) {
                newlore+="</span>"
            } else
            word += `<span class="c${color}">`
            colors.push(color)
        } else {
            word += lore[i];
        }
    }
    newlore += word;
    for (let i = 0; i < colors.length; i++) {
        newlore+="</span>"
    }
    
    return "<div lore><br>" + newlore.replace(/\n/g, "<br>") + "</div>"
}

const correctRarity = (auc: AuctionResponse) => {
    let rarity = $$("#rarity").value
    if (rarity === "NONE") {
        return true
    } else {
        return auc.tier === $$("#rarity").value
    }
}

const formatName = (auc: AuctionResponse) => {
    
    return `<span class="${auc.tier} star">${auc.item_name.split(/[➊➋➌➍➎✪]/g).join("")}</span><span class="ce star">${auc.item_name.replace(/[^✪]/g, "")}</span><span class="c4">${auc.item_name.replace(/[^➊➋➌➍➎]/g, "")}</span>`
}

const correctBin = (isbin: boolean) => {
    let rarity = $$("#binonly").value
    if (rarity === "both") {
        return true;
    }
    if (rarity === "auction") return isbin === false;
    else if (rarity === "bin") return isbin === true
}

const sortAuctions = (filtered: AuctionResponse[]) => {
    console.log("sorting")
    let sortby = $$("#sort").value
    if (sortby === "random") return filtered;
    else if (sortby === "lowest") return filtered.sort((a, b) => (getAuctionPrice(a) - getAuctionPrice(b)))
    else if (sortby === "highest") return filtered.sort((a, b) => -(getAuctionPrice(a) - getAuctionPrice(b)))
}

function getPrice(auc: AuctionResponse) {
    if (auc.bin)
    return `<span class="c6">Price: </span><span class="ce">${commaPrice(auc.starting_bid)}</span>`
    else {
        let price = Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount))
        return `<span class="c6">Highest Bid: </span><span class="ce">${commaPrice(price)}</span>`
    }
}

function getAuctionPrice(auc: AuctionResponse) {
    return  Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount))
}

function correctLore(auc: AuctionResponse) {
    let val = $$('#loresearch').value.toLowerCase().split(",")
    
    for (let a of val) {
        if (!auc.item_lore.toLowerCase().includes(a)) return false;
    }
    return true;
}
function correctStars(auc: AuctionResponse) {
    let val = $$("#stars").value;
    if (val === "any") return true;
    if (val === "no") return !auc.item_name.includes("✪")
    if (val === "✪") return auc.item_name.replace(/[^✪]/g, "").length === 1
    if (val === "✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 2
    if (val === "✪✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 3
    if (val === "✪✪✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 4
    if (val === "✪✪✪✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 5
    else return auc.item_name.includes(val)

}

const updateAuctionBrowser = (data: AuctionPageResponse, reload = false) => {
    console.log("Updated auction browser")
    howmuchshow = $$("#show").value
    console.log(data)
    $$(".auc").innerHTML = ""

    let filtered = data.auctions.filter(
        auc => 
        auc.item_name.toLowerCase().includes($$('#search').value.toLowerCase()) 
        && correctRarity(auc) 
        && correctBin(auc.bin ?? false) 
        && correctLore(auc)
        && correctStars(auc)
        && ((auc.extradata?.hot_potato_count?.value ?? 0) === parseInt($$("#hotpotato").value) || $$("#hotpotato").value === "any")
        && correctArtofWar(auc)
        && (((auc.extradata?.rarity_upgrades?.value ?? 0) === ($$("#recom").value === "true" ? 1 : 0)) || ($$("#recom").value === "any"))
    )
    filtered = sortAuctions(filtered) ?? []
    $$(".loaded").textContent = `${filtered.slice(0, howmuchshow).length} out of ${filtered.length}`
    for (let auc of filtered.slice(0, howmuchshow)) {
        renderPanel(auc, data)
    }

}

type AuctionPageResponse = {
        success: boolean,
        page: number,
        totalPages: number,
        totalAuctions: number,
        lastUpdated: bigint,
        auctions: AuctionResponse[]
}

type AuctionResponse = {
    _id	: string,
    uuid: string,
    auctioneer: string,
    profile_id: string,
    coop: string[],
    start: bigint,
    end: bigint,
    item_name: string,
    item_lore: string,
    extra: string,
    category: string,
    tier: string,
    starting_bid: number,
    item_bytes: string,
    claimed: string,
    claimed_bidders: any[],
    highest_bid_amount: number,
    bids: {auction_id: string, bidder: string, profile_id: string, amount: number, timestamp: bigint}[],
    bin: true | undefined,
    item_id: string,
    extradata: any;
}
let items: any[] = [];

(async () => {
    let res = await fetch("https://api.hypixel.net/resources/skyblock/items")
    let data = await res.json()
    items = data.items
    items.map(d => {
        if (d.id.startsWith("STARRED_")) d.name = "⚚ " + d.name;
        return d;
    })
})()

let load = (async (redownload = false) => {
    $$(".auc").innerHTML = "Fetching page data..."
    let res = await fetch("https://api.hypixel.net/skyblock/auctions?page=0")
    let data = await res.json()
    let aucs: AuctionPageResponse[] = []
    $$(".alert").style.display = "block"
    let pages = data.totalPages
    if (localStorage.getItem("dev") === "true") pages = 10;
    $$(".alert").textContent = "Downloading data: 0/" + pages
    $$('#search').addEventListener("input", () => {
        setTimeout(() => {
            updateAuctionBrowser(d)

            $$(".autocomplete").innerHTML = ""

            for (let item of items.filter(p => p.name.toLowerCase().includes($$('#search').value.toLowerCase()))) {
                let e = document.createElement("div")

                e.innerHTML = `<div class="item-autocomplete item-${item.id}">${item.name}</div>`
                $$(".autocomplete").appendChild(e);
                e.addEventListener('mousedown', () => {
                    console.log("why")
                    $$('#search').value = item.name;
                    updateAuctionBrowser(d)

                })
            }
        }, 0);
        
    })
    let updateids = ["rarity", "binonly", "stars", "show", "sort", "loresearch", "artofwar", "hotpotato", "recom"]
    for (let id of updateids) {
        $$('#' + id).addEventListener("change", () => setTimeout(() => updateAuctionBrowser(d), 0))
        $$('#' + id).addEventListener("input", () => setTimeout(() => updateAuctionBrowser(d), 0))
    }
    let fetches: Promise<Response>[] = []
    for (let i = 0; i < pages; i++) {
        fetches.push(fetch("https://api.hypixel.net/skyblock/auctions?page=" + i))
        
    }
    let loaded = 0;
    $$(".alert").textContent = "Downloading data - 0/" + pages;
    (await Promise.all(fetches)).forEach(async (res) => {
        let data: any = await res.json();

        aucs.push(...data.auctions.map((da: AuctionResponse) => {
            let parsed = parseNBT(da.item_bytes)
            let attributes = parsed.value.i.value.value[0].tag.value.ExtraAttributes.value
            da.item_id = attributes.id.value
            da.extradata = attributes
            return da;
        }));
        data.auctions = aucs;
        d = data;
        updateAuctionBrowser(data);
        
        
        loaded++;
        $$(".alert").textContent = (redownload ? "Red" : "D") + "ownloading auction data - " + loaded + "/" + pages;
        if (loaded === pages) $$(".alert").style.display = "none"
    })
    
    
    console.log(data)

    
})



function position_tooltip(el: any){
    // Get .ktooltiptext sibling
    var tooltip = el;
  
    // Get calculated tooltip coordinates and size
    var tooltip_rect = tooltip.getBoundingClientRect();
    // Corrections if out of window
    if ((tooltip_rect.x + tooltip_rect.width) >= window.innerWidth) // Out on the right
        tooltip.style.transform = "translate(-100%, -100px)"
  }
function $$(query: string) {
    return document.querySelector(query) as any;
}

function $$all (query: string) {
    return document.querySelectorAll(query) as any
}

declare namespace pako {
    function deflate(bytes: string): Uint8Array
    function inflate(bytes: any): Uint8Array
    function ungzip(bytes: string): Uint8Array
}

declare namespace nbt {
    function parseUncompressed(bytes: any): any
}

function parseNBT(bytes: string): any {
    let atobed = atob(bytes).split("").map(c => c.charCodeAt(0))
    let deflated = pako.inflate(atobed);

    let parsed = nbt.parseUncompressed(deflated);
    return parsed
}

async function getLowestBin(itemid: string, auctions: AuctionResponse[], tier: string) {
    let cheapest = 99999999999999
    for (let auc of fil((a: AuctionResponse) => a.item_id === itemid && a.tier === tier, auctions)) {
        if (auc.bin && auc.starting_bid < cheapest) {
            cheapest = auc.starting_bid
        }
    }

    return cheapest === 99999999999999 ? -1 : cheapest
}

const fil = (fn: (d: any) => boolean, a: any[]) => {
    const f = []; //final
    for (let i = 0; i < a.length; i++) {
      if (fn(a[i])) {
        f.push(a[i]);
      }
    }
    return f;
  };

async function getMarketPrice(itemid: string, auctions: AuctionResponse[] , tier: string) {

    let cheapest = 99999999999999
    let cheapest2 = 99999999999998
    let cheapest3 = 99999999999997
    let prices = []
    for (let auc of fil((a: AuctionResponse) => a.item_id === itemid && a.tier === tier, auctions)) {
        if (auc.bin) {
            if (auc.starting_bid < cheapest) {
                cheapest3 = cheapest2
                cheapest2 = cheapest;
                
                cheapest = auc.starting_bid;
                
            } else if (auc.starting_bid < cheapest2) {
                cheapest3 = cheapest2;
                cheapest2 = auc.starting_bid;
                
            } else if (auc.starting_bid < cheapest3) {
                cheapest3 = auc.starting_bid;
            }
            

            prices.push(auc.starting_bid)
        }
    }
    if ([99999999999999, 99999999999998, 99999999999997].includes(cheapest2)) cheapest2 = cheapest
    if ([99999999999999, 99999999999998, 99999999999997].includes(cheapest3)) cheapest3 = cheapest2
    prices.sort()
    async function median(values: number[]){
        if(values.length ===0) throw new Error("No inputs");
      
        values.sort(function(a,b){
          return a-b;
        });
      
        var half = Math.floor(values.length / 2);
        
        if (values.length % 2)
          return values[half];
        
        return (values[half - 1] + values[half]) / 2.0;
      }
    

    return cheapest === 99999999999999 ? -1 : (await median(prices) + cheapest + cheapest2 + cheapest3)/4
}


async function getMeanPrice(itemid: string, auctions: AuctionResponse[], tier: string) {

    let s = 0
    let n = 0;
    for (let auc of fil((a: AuctionResponse) => a.item_id === itemid && a.tier === tier, auctions)) {
            s += (auc.starting_bid)
            n++;
        }

    

    return parseInt((s/n).toFixed(2))
}

function getCheapest(itemid: string, auctions: AuctionResponse[], tier: string) {
    let prices = []
    for (let auc of fil((a: AuctionResponse) => a.item_id === itemid && a.tier === tier, auctions)) {
        if (auc.bin) {
            prices.push(auc)
        }
    }

    return prices.sort((a, b) => a.starting_bid - b.starting_bid)
}

















load()


function renderPanel(auc: AuctionResponse, data: AuctionPageResponse) {
    let elem = document.createElement('div')
    elem.className = "itempanel"
    
    elem.innerHTML = `<b>${formatName(auc)}</b> - ${getPrice(auc)}`
    $$(".auc").appendChild(elem)
    elem.addEventListener("mouseenter", () => {
        let el = document.createElement("div")
        el.style.position = "absolute"
        el.classList.add("info")
        el.innerHTML = `${parseLore(auc.item_lore)}<br><span class="cd">Internal Id: </span><span class="c7">${auc.item_id}</span><br><span class="c6">Lowest Bin: </span><span class="ce lowestbin">Calculating...</span><br><span class="c6">Market Price: </span><span class="ce marketprice">Calculating...</span><br><span class="c6">Mean Price: </span><span class="ce meanprice">Calculating...</span>`
        // [*] Extra Data Place
        elem.appendChild(el)
        position_tooltip(el);
        setTimeout(async () => {
            let low = await getLowestBin(auc.item_id, data.auctions, auc.tier)
            $$(".lowestbin")!.textContent = commaPrice(low)
        }, 0)
        setTimeout(async () => {
            let low = await getMarketPrice(auc.item_id, data.auctions, auc.tier)
            $$(".marketprice")!.textContent = commaPrice(low)
        }, 0)
        setTimeout(async () => {
            let low = await getMeanPrice(auc.item_id, data.auctions, auc.tier)
            $$(".meanprice")!.textContent = commaPrice(low)
        }, 0)
        
    })

    elem.addEventListener("mouseleave", () => {
        $$all('.info').forEach((elem: HTMLElement) => elem.remove())
        stopcalc = true;
    })

    elem.addEventListener('click', () => {
        var copyText = document.createElement("textarea");
        copyText.value = `/viewauction ${auc.uuid}`
        // Select the text field
        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices
        
            // Copy the text inside the text field
        navigator.clipboard.writeText(copyText.value);
        
        // Alert the copied text
        alert("Copied the text: " + copyText.value);
    })
}

let marketthreshold = 100000;
let lbinthreshold = 100000;
let ignore = ["PET", "POTION"];
let minmax: [number, number] = [0, 4.1*1000000]

document.addEventListener("keydown", (e) => {
    
    if (e.shiftKey && e.ctrlKey && e.key === "F") {
        $$(".auc").innerHTML = "Calculated Flips"
        $$(".alert").style.display = "block"
        $$(".alert").textContent = "Calculating Flips..."
        for (let item of items) {
            if (ignore.includes(item.id) || item.id.includes("ADAPTIVE")) continue;
            $$(".alert").textContent = `CC: ${item.id}`
            let cheap = getCheapest(item.id, d.auctions, item.tier)
            if (cheap[0] !== undefined && cheap[0].item_lore.toLowerCase().includes("skin")) continue;
            if (cheap.length > 2 && cheap[1].starting_bid - cheap[0].starting_bid > lbinthreshold && cheap[0].starting_bid >= minmax[0] && cheap[0].starting_bid <= minmax[1]) {
                renderPanel(cheap[0], d)
            }
        }
        $$(".alert").style.display = "none"
    }
});

function toggleOptions() {
    $$(".options")?.classList.toggle("options-disabled")    
}

function correctArtofWar(auc: AuctionResponse) {
    return (((auc.extradata?.art_of_war_count?.value ?? 0) === ($$("#artofwar").value === "true" ? 1 : 0)) || ($$("#artofwar").value === "any"))
}

function correctRecombobulated(auc: AuctionResponse) {
    
}