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
       
        elem.innerHTML = `<b>${formatName(auc)}</b> - ${getPrice(auc)}`
        document.querySelector(".auc").appendChild(elem)
        
        elem.addEventListener("mouseenter", () => {
            let el = document.createElement("div")
            el.style.position = "absolute"
            el.classList.add("info")
            el.innerHTML = `${parseLore(auc.item_lore)}`
            elem.appendChild(el)
            position_tooltip(el)
        })

        elem.addEventListener("mouseleave", () => {
            document.querySelectorAll('.info').forEach(elem => elem.remove())
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

}
(async () => {
    
    document.querySelector(".auc").innerHTML = "Fetching page data..."
    let res = await fetch("https://api.hypixel.net/skyblock/auctions?page=0")
    let data = await res.json()
    let aucs = []
    document.querySelector(".alert").style.display = "block"
    let pages = data.totalPages
    document.querySelector(".alert").textContent = "Downloading data: 0/" + pages
    document.getElementById('search').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('rarity').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('binonly').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('stars').addEventListener("change", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('show').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    document.getElementById('sort').addEventListener("change", () => setTimeout(() => {updateAuctionBrowser(data); console.log("test")}, 0))
    document.getElementById('loresearch').addEventListener("input", () => setTimeout(() => updateAuctionBrowser(data), 0))
    let fetches = []
    for (let i = 0; i < pages; i++) {
        fetches.push(fetch("https://api.hypixel.net/skyblock/auctions?page=" + i))
        
    }
    let loaded = 0;
    document.querySelector(".alert").textContent = "Downloading data - 0/" + pages;
    (await Promise.all(fetches)).forEach(async (res) => {
        let data = await res.json();

        aucs.push(...data.auctions);
        data.auctions = aucs;
        updateAuctionBrowser(data);
        d = data;
        
        loaded++;
        document.querySelector(".alert").textContent = "Downloading auction data - " + loaded + "/" + pages;
        if (loaded === pages) document.querySelector(".alert").style.display = "none"
    })
    
    
    console.log(data)

    
})()



function position_tooltip(el){
    // Get .ktooltiptext sibling
    var tooltip = el;
  
    // Get calculated tooltip coordinates and size
    var tooltip_rect = tooltip.getBoundingClientRect();
    // Corrections if out of window
    if ((tooltip_rect.x + tooltip_rect.width) >= window.innerWidth) // Out on the right
        tooltip.style.transform = "translate(-100%, -100px)"
  }
