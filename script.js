let d;
let howmuchshow = 50;
let binonly = false;
const parseLore = (lore) => {
    let newlore = ""
    let word = ""
    let color = ""
    let colors = []
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

const correctRarity = (auc) => {
    let rarity = document.getElementById("rarity").value
    if (rarity === "NONE") {
        return true
    } else {
        return auc.tier === document.getElementById("rarity").value
    }
}

const formatName = (auc) => {
    
    return `<span class="${auc.tier} star">${auc.item_name.split(/[➊➋➌➍➎✪]/g).join("")}</span><span class="ce star">${auc.item_name.replace(/[^✪]/g, "")}</span><span class="c4">${auc.item_name.replace(/[^➊➋➌➍➎]/g, "")}</span>`
}

const correctBin = (isbin) => {
    let rarity = document.getElementById("binonly").value
    if (rarity === "both") {
        return true;
    }
    if (rarity === "auction") return isbin === false;
    else if (rarity === "bin") return isbin === true
}

const sortAuctions = (filtered) => {
    console.log("sorting")
    let sortby = document.getElementById("sort").value
    if (sortby === "random") return filtered;
    else if (sortby === "lowest") return filtered.sort((a, b) => (getAuctionPrice(a) - getAuctionPrice(b)))
    else if (sortby === "highest") return filtered.sort((a, b) => -(getAuctionPrice(a) - getAuctionPrice(b)))
}

function getPrice(auc) {
    if (auc.bin)
    return `<span class="c6">Price: </span><span class="ce">${auc.starting_bid}</span>`
    else {
        let price = Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount))
        return `<span class="c6">Highest Bid: </span><span class="ce">${price}</span>`
    }
}

function getAuctionPrice(auc) {
    return  Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount))
}

function correctLore(auc) {
    let val = document.getElementById('loresearch').value.toLowerCase().split(",")
    
    for (let a of val) {
        if (!auc.item_lore.toLowerCase().includes(a)) return false;
    }
    return true;
}
function correctStars(auc) {
    let val = document.getElementById("stars").value;
    if (val === "any") return true;
    if (val === "no") return !auc.item_name.includes("✪")
    if (val === "✪") return auc.item_name.replace(/[^✪]/g, "").length === 1
    if (val === "✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 2
    if (val === "✪✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 3
    if (val === "✪✪✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 4
    if (val === "✪✪✪✪✪") return auc.item_name.replace(/[^✪]/g, "").length === 5
    else return auc.item_name.includes(val)

}

const updateAuctionBrowser = async (data) => {
    console.log("Updated auction browser")
    howmuchshow = document.querySelector("#show").value
    
    document.querySelector(".auc").innerHTML = ""
    let filtered = data.auctions.filter(
        auc => 
        auc.item_name.toLowerCase().includes(document.getElementById('search').value.toLowerCase()) 
        && correctRarity(auc) 
        && correctBin(auc.bin ?? false) 
        && correctLore(auc)
        && correctStars(auc)
    )
    filtered = sortAuctions(filtered)
    for (let auc of filtered.slice(0, howmuchshow)) {
        let elem = document.createElement('div')
        elem.className = "itempanel"
       
        elem.innerHTML = `<b>${formatName(auc)}</b> - ${getPrice(auc)} - Lore: <button id="check-lore${auc.uuid}">Check Lore</button> - <button id="copydata${auc.uuid}">Copy auction command</button>`
        document.querySelector(".auc").appendChild(elem)
        const d = () => {
            document.getElementById(`check-lore${auc.uuid}`).outerHTML = `<div id="check-lore${auc.uuid}">${parseLore(auc.item_lore)}</div>`
            document.getElementById(`check-lore${auc.uuid}`).addEventListener('click', () => {
                document.getElementById(`check-lore${auc.uuid}`).outerHTML = `<button id="check-lore${auc.uuid}">Check Lore</button>`
                document.getElementById(`check-lore${auc.uuid}`).addEventListener('click', d)
            })
        }
        document.getElementById(`check-lore${auc.uuid}`).addEventListener('click', d)
        document.getElementById(`copydata${auc.uuid}`).addEventListener('click', () => {
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

}
(async () => {
    
    document.querySelector(".auc").innerHTML = "Fetching page data..."
    let res = await fetch("https://api.hypixel.net/skyblock/auctions?page=0")
    let data = await res.json()
    let aucs = []
    document.querySelector(".alert").style.display = "block"
    let pages = parseInt(prompt('How many pages (1000 auctions each)? Total pages: ' + data.totalPages))
    document.querySelector(".alert").textContent = "Downloading data: 0/" + pages
    document.getElementById('search').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('rarity').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('binonly').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('stars').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('show').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('sort').addEventListener("change", () => setTimeout(() => {updateAuctionBrowser(data); console.log("test")}, 0))
    document.getElementById('loresearch').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    for (let i = 0; i < pages; i++) {
        console.log(`Fetching page ${i}...`)
        let res = await fetch("https://api.hypixel.net/skyblock/auctions?page=" + i)
        let data = await res.json()
        console.log(`Fetched page ${i}!`)
        document.querySelector(".alert").textContent = "Downloading data: " + (i+1) + "/" + pages
        aucs.push(...data.auctions)
        data.auctions = aucs
        updateAuctionBrowser(data)
        d = data;
    }
    document.querySelector(".alert").style.display = "none"
    
    
    
    console.log(data)

    
})()

