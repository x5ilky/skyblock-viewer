let d;
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
const updateAuctionBrowser = async (data) => {
    document.querySelector(".auc").innerHTML = ""
    console.log("test")
    let filtered = data.auctions.filter(auc => auc.item_name.toLowerCase().includes(document.getElementById('search').value.toLowerCase()))
    for (let auc of filtered.slice(0, 50)) {
        let elem = document.createElement('div')
        elem.className = "itempanel"
        elem.innerHTML = `<div class="itempanel"><b><span class="${auc.tier}">${auc.item_name}</span></b> - <span class="c6">Price: </span><span class="ce">${auc.starting_bid}</span> - Lore: <button id="check-lore${auc.uuid}">Check Lore</button></div>`
        document.querySelector(".auc").appendChild(elem)
        document.getElementById(`check-lore${auc.uuid}`).addEventListener('click', () => {
            document.getElementById(`check-lore${auc.uuid}`).outerHTML = parseLore(auc.item_lore)
        })
    }

}
(async () => {
    let res = await fetch("https://api.hypixel.net/skyblock/auctions?page=0")
    let data = await res.json()
    let aucs = []
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
})()