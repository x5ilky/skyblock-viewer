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
    else return true
}

const updateAuctionBrowser = async (data) => {
    howmuchshow = document.querySelector("#show").value
    document.querySelector(".auc").innerHTML = ""
    console.log("test")
    let filtered = data.auctions.filter(auc => auc.item_name.toLowerCase().includes(document.getElementById('search').value.toLowerCase()) && correctRarity(auc) && correctBin(auc.bin ?? false))
    for (let auc of filtered.slice(0, howmuchshow)) {
        if (auc.bin) console.log("bin auction")
        let elem = document.createElement('div')
        elem.className = "itempanel"
        function getPrice() {
            if (auc.bin)
            return `<span class="c6">Price: </span><span class="ce">${auc.starting_bid}</span>`
            else {
                let price = Math.max(auc.starting_bid, ...auc.bids.map(a => a.amount))
                return `<span class="c6">Highest Bid: </span><span class="ce">${price}</span>`
            }
        }
        elem.innerHTML = `<b>${formatName(auc)}</b> - ${getPrice()} - Lore: <button id="check-lore${auc.uuid}">Check Lore</button> - <button id="copydata${auc.uuid}">Copy auction command</button>`
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
    document.querySelector(".auc").innerHTML = ""
    let pages = parseInt(prompt('How many pages (1000 auctions each)? Total pages: ' + data.totalPages))
    document.querySelector(".auc").innerHTML = "Downloading data: 0/" + pages
    for (let i = 0; i < pages; i++) {
        console.log(`Fetching page ${i}...`)
        let res = await fetch("https://api.hypixel.net/skyblock/auctions?page=" + i)
        let data = await res.json()
        console.log(`Fetched page ${i}!`)
        document.querySelector(".auc").innerHTML = "Downloading data: " + i + "/" + pages
        aucs.push(...data.auctions)
    }
    
    data.auctions = aucs
    updateAuctionBrowser(data)
    console.log(data)

    document.getElementById('search').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('rarity').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('binonly').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('show').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
})()

